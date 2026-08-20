package com.lrtjabodebek.widget

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.Handler
import android.os.Looper
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlin.coroutines.resume

class WidgetRenderWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    companion object {
        const val WIDGET_URL_BASE = "https://lrt-widget-v9q1.vercel.app/"
        const val PREFS_NAME = "lrt_widget_prefs"
        const val PREF_STATION = "station"
        const val PREF_DIRECTION = "direction"
        const val WIDGET_WIDTH_DP = 320
        const val WIDGET_HEIGHT_DP = 200
    }

    override suspend fun doWork(): Result {
        return try {
            val bitmap = renderWidgetView()
            if (bitmap != null) {
                LrtWidgetProvider.pushBitmapToWidget(context, bitmap)
                Result.success()
            } else {
                Result.retry()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Result.retry()
        }
    }

    private suspend fun renderWidgetView(): Bitmap? = withContext(Dispatchers.Main) {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val station = prefs.getString(PREF_STATION, "Cawang") ?: "Cawang"
        val direction = prefs.getString(PREF_DIRECTION, "inbound") ?: "inbound"

        val widgetUrl = buildString {
            append(WIDGET_URL_BASE)
            append("?view=widget")
            append("&station=")
            append(station)
            append("&direction=")
            append(direction)
        }

        return@withContext renderWebViewToBitmap(widgetUrl)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private suspend fun renderWebViewToBitmap(url: String): Bitmap? =
        suspendCancellableCoroutine { continuation ->
            val density = context.resources.displayMetrics.density
            val widthPx = (WIDGET_WIDTH_DP * density).toInt()
            val heightPx = (WIDGET_HEIGHT_DP * density).toInt()

            val handler = Handler(Looper.getMainLooper())

            handler.post {
                val webView = WebView(context)
                webView.settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    cacheMode = WebSettings.LOAD_DEFAULT
                    loadWithOverviewMode = false
                    useWideViewPort = true
                    setSupportZoom(false)
                }
                webView.measure(
                    android.view.View.MeasureSpec.makeMeasureSpec(widthPx, android.view.View.MeasureSpec.EXACTLY),
                    android.view.View.MeasureSpec.makeMeasureSpec(heightPx, android.view.View.MeasureSpec.EXACTLY)
                )
                webView.layout(0, 0, widthPx, heightPx)

                webView.webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, loadedUrl: String?) {
                        // Give JS time to render dynamic content (countdown, station list)
                        handler.postDelayed({
                            try {
                                val bitmap = Bitmap.createBitmap(widthPx, heightPx, Bitmap.Config.ARGB_8888)
                                val canvas = Canvas(bitmap)
                                view?.draw(canvas)
                                if (!continuation.isCompleted) {
                                    continuation.resume(bitmap)
                                }
                            } catch (e: Exception) {
                                if (!continuation.isCompleted) {
                                    continuation.resume(null)
                                }
                            }
                        }, 3000) // Wait 3 seconds for JS to complete rendering
                    }
                }
                webView.loadUrl(url)

                continuation.invokeOnCancellation {
                    webView.destroy()
                }
            }
        }
}
