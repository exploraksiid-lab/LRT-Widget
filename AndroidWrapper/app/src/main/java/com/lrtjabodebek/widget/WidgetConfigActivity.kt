package com.lrtjabodebek.widget

import android.appwidget.AppWidgetManager
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.RadioGroup
import android.widget.Spinner
import androidx.appcompat.app.AppCompatActivity

class WidgetConfigActivity : AppCompatActivity() {

    private var appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID

    private val stations = listOf(
        "Harjamukti", "Ciracas", "Kampung Rambutan", "TMII", "Cawang",
        "Ciliwung", "Cikoko", "Pancoran", "Kuningan", "Rasuna Said",
        "Setiabudi", "Dukuh Atas BSI", "Jati Mulya", "Bekasi Timur",
        "Bekasi Barat", "Cikunir I", "Cikunir II", "Jatibening Baru",
        "Halim", "Cibubur", "Harjamukti"
    ).distinct().sorted()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_widget_config)

        // Get the widget ID from intent
        appWidgetId = intent?.extras?.getInt(
            AppWidgetManager.EXTRA_APPWIDGET_ID,
            AppWidgetManager.INVALID_APPWIDGET_ID
        ) ?: AppWidgetManager.INVALID_APPWIDGET_ID

        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish()
            return
        }

        // Set result to CANCELED in case user presses back
        setResult(RESULT_CANCELED)

        // Setup station spinner
        val stationSpinner: Spinner = findViewById(R.id.spinner_station)
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, stations)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        stationSpinner.adapter = adapter

        // Default selection: Cawang
        val cawangIndex = stations.indexOf("Cawang")
        if (cawangIndex >= 0) stationSpinner.setSelection(cawangIndex)

        // Setup confirm button
        val confirmButton: Button = findViewById(R.id.btn_confirm_config)
        confirmButton.setOnClickListener {
            val selectedStation = stationSpinner.selectedItem.toString()

            val directionGroup: RadioGroup = findViewById(R.id.radio_direction)
            val selectedDirection = when (directionGroup.checkedRadioButtonId) {
                R.id.radio_outbound -> "outbound"
                else -> "inbound"
            }

            // Save to SharedPreferences
            val prefs: SharedPreferences = getSharedPreferences(
                WidgetRenderWorker.PREFS_NAME, MODE_PRIVATE
            )
            prefs.edit()
                .putString(WidgetRenderWorker.PREF_STATION, selectedStation)
                .putString(WidgetRenderWorker.PREF_DIRECTION, selectedDirection)
                .apply()

            // Trigger first widget render
            LrtWidgetProvider.updateAllWidgets(this)

            val resultValue = Intent().apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
            }
            setResult(RESULT_OK, resultValue)
            finish()
        }
    }
}
