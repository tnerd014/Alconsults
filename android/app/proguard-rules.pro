# Proguard rules for AIConsults Android
-dontwarn android.webkit.**
-keepattributes *Annotation*
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
