package com.lrtjabodebek.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.widget.RemoteViews
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager

class LrtWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_REFRESH = "com.lrtjabodebek.widget.ACTION_REFRESH"

        fun updateAllWidgets(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(
                ComponentName(context, LrtWidgetProvider::class.java)
            )
            if (ids.isNotEmpty()) {
                // Trigger render via WorkManager
                val workRequest = OneTimeWorkRequestBuilder<WidgetRenderWorker>().build()
                WorkManager.getInstance(context).enqueue(workRequest)
            }
        }

        fun pushBitmapToWidget(context: Context, bitmap: Bitmap) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(
                ComponentName(context, LrtWidgetProvider::class.java)
            )

            for (id in ids) {
                val views = RemoteViews(context.packageName, R.layout.widget_layout)

                // Set the rendered bitmap
                views.setImageViewBitmap(R.id.widget_webview_image, bitmap)

                // Tap widget -> open MainActivity (full PWA)
                val openIntent = Intent(context, MainActivity::class.java)
                val openPending = PendingIntent.getActivity(
                    context, 0, openIntent,
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
                )
                views.setOnClickPendingIntent(R.id.widget_webview_image, openPending)

                // Tap refresh button -> trigger re-render
                val refreshIntent = Intent(context, LrtWidgetProvider::class.java).apply {
                    action = ACTION_REFRESH
                }
                val refreshPending = PendingIntent.getBroadcast(
                    context, 1, refreshIntent,
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
                )
                views.setOnClickPendingIntent(R.id.widget_refresh_btn, refreshPending)

                manager.updateAppWidget(id, views)
            }
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (id in appWidgetIds) {
            // Show loading state
            val views = RemoteViews(context.packageName, R.layout.widget_layout)
            appWidgetManager.updateAppWidget(id, views)
        }
        // Trigger headless WebView render in background
        updateAllWidgets(context)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            updateAllWidgets(context)
        }
    }

    override fun onEnabled(context: Context) {
        updateAllWidgets(context)
    }
}
