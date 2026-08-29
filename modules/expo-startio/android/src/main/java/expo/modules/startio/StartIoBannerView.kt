package expo.modules.startio

import android.content.Context
import android.widget.FrameLayout
import android.widget.FrameLayout.LayoutParams
import com.startapp.sdk.ads.banner.Banner
import com.startapp.sdk.ads.banner.BannerListener
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import android.view.View
import android.view.View.MeasureSpec
import android.util.Log

class StartIoBannerView(context: Context, appContext: expo.modules.kotlin.AppContext) : ExpoView(context, appContext) {
  private val onAdLoaded by EventDispatcher<Map<String, String>>()
  private val onAdFailedToLoad by EventDispatcher<Map<String, String>>()
  
  private var bannerAd: Banner? = null

  init {
    try {
      bannerAd = Banner(context, object : BannerListener {
        override fun onReceiveAd(p0: View?) {
          Log.i("ExpoStartioBanner", "Ad received")
          onAdLoaded(mapOf())
        }

        override fun onFailedToReceiveAd(p0: View?) {
          Log.e("ExpoStartioBanner", "Failed to receive ad")
          onAdFailedToLoad(mapOf("error" to "Failed to load ad"))
        }

        override fun onImpression(p0: View?) {
          Log.i("ExpoStartioBanner", "Ad impression")
        }

        override fun onClick(p0: View?) {
          Log.i("ExpoStartioBanner", "Ad clicked")
        }
      })
      
      val layoutParams = LayoutParams(
        LayoutParams.MATCH_PARENT,
        LayoutParams.WRAP_CONTENT
      )
      addView(bannerAd, layoutParams)
    } catch (e: Exception) {
      Log.e("ExpoStartioBanner", "Error creating banner", e)
    }
  }

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }

  private val measureAndLayout = Runnable {
    measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    )
    layout(left, top, right, bottom)
  }
}
