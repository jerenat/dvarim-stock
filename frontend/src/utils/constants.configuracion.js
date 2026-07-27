export function actualizarEmpresa(setEmpresa, campo, valor) {
  setEmpresa((empresaAnterior) => ({
    ...empresaAnterior,
    [campo]: valor,
  }));
}

export function actualizarPassword(setPasswordForm, campo, valor) {
  setPasswordForm((anterior) => ({
    ...anterior,
    [campo]: valor,
  }));
}

export function validarPassword(passwordForm) {
  const {
    passwordActual,
    passwordNueva,
    confirmarPassword,
  } = passwordForm;

  if (!passwordActual || !passwordNueva || !confirmarPassword) {
    return "Complete todos los campos";
  }

  if (passwordNueva !== confirmarPassword) {
    return "Las contraseñas no coinciden";
  }

  if (passwordNueva.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres";
  }

  return null;
}

export const PASSWORD_INICIAL = {
    passwordActual:"",
    passwordNueva:"",
    confirmarPassword:"",
};