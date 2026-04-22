type UsuarioLike = {
  rol?: string | null;
  role?: string | null;
  email?: string | null;
};

export function resolveAppRole(usuario: UsuarioLike | null | undefined): 'admin' | 'user' {
  const rol = String(usuario?.rol ?? usuario?.role ?? '').trim().toLowerCase();
  const email = String(usuario?.email ?? '').trim().toLowerCase();

  if (rol === 'admin' || rol === 'administrador' || email === 'admin@walkea.com') {
    return 'admin';
  }

  return 'user';
}
