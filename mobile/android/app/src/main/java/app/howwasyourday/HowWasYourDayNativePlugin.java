package app.howwasyourday;

import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.firebase.messaging.FirebaseMessaging;

// Loaded by the Capacitor bridge BEFORE the first page loads, so the
// synchronous window.HowWasYourDayAndroid object (HowWasYourDayBridge) exists on every page
// of www.howwasyourday.live from the start. Also fetches the FCM token once per launch.
@CapacitorPlugin(name = "HowWasYourDayNative")
public class HowWasYourDayNativePlugin extends Plugin {
    @Override
    public void load() {
        getBridge().getWebView().addJavascriptInterface(new HowWasYourDayBridge(getActivity()), "HowWasYourDayAndroid");
        refreshPushToken(getActivity().getApplicationContext());
    }

    static void refreshPushToken(android.content.Context ctx) {
        try {
            FirebaseMessaging.getInstance().getToken().addOnSuccessListener(token -> {
                if (token != null && !token.isEmpty()) Prefs.get(ctx).edit().putString(Prefs.PUSH_TOKEN, token).apply();
            });
        } catch (Exception ignored) {
            // No google-services.json in this build (e.g. a CI test build) — no push.
        }
    }
}
