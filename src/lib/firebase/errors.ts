export function getFirebaseErrorMessage(err: unknown, defaultMessage = "Ocurrió un error inesperado."): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const error = err as { code: string; message?: string };
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "El correo electrónico o la contraseña son incorrectos.";
      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Por favor, inténtalo de nuevo más tarde.";
      case "auth/user-disabled":
        return "Esta cuenta ha sido deshabilitada. Contacta con soporte.";
      case "auth/invalid-email":
        return "El formato del correo electrónico no es válido.";
      default:
        // Si no tenemos un caso amigable, mostramos el mensaje original o el default
        return error.message || defaultMessage;
    }
  }

  if (err instanceof Error) {
    if (
      err.message.includes("auth/invalid-credential") ||
      err.message.includes("auth/wrong-password") ||
      err.message.includes("auth/user-not-found")
    ) {
      return "El correo electrónico o la contraseña son incorrectos.";
    }
    if (err.message.includes("auth/too-many-requests")) {
      return "Demasiados intentos fallidos. Por favor, inténtalo de nuevo más tarde.";
    }
    return err.message;
  }

  return defaultMessage;
}
