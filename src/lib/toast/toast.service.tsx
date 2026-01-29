import { showToast } from "nextjs-toast-notify";

export class ToastService {
  public static showSuccessToast(message: string) {
    showToast.success(message, {
      duration: 4000,
      progress: true,
      position: "bottom-left",
      transition: "bounceIn",
      icon: "",
      sound: true,
    });
  }
  public static showErrorToast(message: string) {
    showToast.error(message, {
    duration: 4000,
    progress: true,
    position: "top-right",
    transition: "bounceIn",
    icon: '',
    sound: true,
  });
  }
}
