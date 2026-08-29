package expo.modules.startio

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.startapp.sdk.adsbase.StartAppAd
import com.startapp.sdk.adsbase.StartAppSDK
import android.util.Log
import android.os.Handler
import android.os.Looper

class ExpoStartioModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoStartio")

    Function("initStartIo") { appId: String, testMode: Boolean ->
      val context = appContext.reactContext
      if (context != null) {
        try {
          StartAppSDK.setTestAdsEnabled(testMode)
          StartAppSDK.init(context, appId, false)
          Log.i("ExpoStartio", "Start.io SDK initialized with App ID: $appId (Test Mode: $testMode)")
        } catch (e: Exception) {
          Log.e("ExpoStartio", "Failed to initialize Start.io SDK", e)
        }
      }
    }

    Function("showInterstitial") {
      val activity = appContext.currentActivity
      if (activity != null) {
        try {
          Handler(Looper.getMainLooper()).post {
            StartAppAd.showAd(activity)
          }
        } catch (e: Exception) {
          Log.e("ExpoStartio", "Failed to show interstitial", e)
        }
      }
    }

    View(StartIoBannerView::class) {
      Events("onAdLoaded", "onAdFailedToLoad")
    }
  }
}
