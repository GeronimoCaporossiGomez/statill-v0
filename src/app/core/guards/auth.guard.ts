import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { map, catchError, of, tap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔐 authGuard: Verificando acceso a', state.url);

  if (authService.isAuthenticated()) {
    console.log('✅ authGuard: Acceso permitido');
    return true;
  }

  console.log('❌ authGuard: Redirigiendo a /landing');
  router.navigate(['/landing']);
  return false;
};

export const confirmacionCodigoGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔐 confirmacionCodigoGuard: Verificando acceso a', state.url);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    console.log('❌ confirmacionCodigoGuard: No autenticado -> /landing');
    router.navigate(['/landing']);
    return false;
  }

  // If user is already loaded and verified, redirect to home
  const user = authService.getCurrentUser();
  if (user?.email_verified) {
    console.log('✅ confirmacionCodigoGuard: Email ya verificado -> /home');
    router.navigate(['/home']);
    return false;
  }

  // If user is loaded and not verified, allow access
  if (user) {
    console.log('✅ confirmacionCodigoGuard: Acceso permitido (usuario no verificado)');
    return true;
  }

  // If user not in memory but authenticated, fetch from server
  console.log('⚠️ confirmacionCodigoGuard: Usuario no en memoria, obteniendo del servidor...');
  return authService.fetchCurrentUser().pipe(
    tap((response) => {
      console.log('📥 Respuesta del servidor:', response);
    }),
    map((response) => {
      if (!response?.successful || !response.data) {
        console.log('❌ confirmacionCodigoGuard: Respuesta inválida -> /landing');
        router.navigate(['/landing']);
        return false;
      }

      const fetchedUser = response.data;
      
      // If already verified, redirect to home
      if (fetchedUser.email_verified) {
        console.log('✅ confirmacionCodigoGuard: Email ya verificado -> /home');
        router.navigate(['/home']);
        return false;
      }

      console.log('✅ confirmacionCodigoGuard: Acceso permitido (usuario no verificado)');
      return true;
    }),
    catchError((error) => {
      console.error('❌ confirmacionCodigoGuard: Error al obtener usuario:', error);
      router.navigate(['/landing']);
      return of(false);
    }),
  );
};
export const allowCreateCommerceGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔐 allowCreateCommerceGuard: verificando acceso a', state.url);

  // Si no está autenticado → /landing
  if (!authService.isAuthenticated()) {
    console.log('❌ No autenticado -> /landing');
    router.navigate(['/landing']);
    return false;
  }

  //  Si el usuario ya está cargado en memoria
  const user = authService.getCurrentUser();
  if (user) {
    const hasStoreRole =
      user.store_role === 'owner' || user.store_role === 'cashier';
    console.log(
      '👤 Usuario en memoria, store_role =',
      user.store_role,
      'hasStoreRole =',
      hasStoreRole,
    );

    if (hasStoreRole) {
      router.navigate(['/menu-local']);
      return false;
    }

    console.log('✅ No tiene comercio, acceso permitido');
    return true;
  }

  // 3️⃣ Si no hay usuario cargado, lo pedimos al servidor
  return authService.fetchCurrentUser().pipe(
    map((response) => {
      if (!response?.successful || !response.data) {
        console.log('❌ No se pudo obtener usuario -> /landing');
        router.navigate(['/landing']);
        return false;
      }

      const fetchedUser = response.data;
      const hasStoreRole =
        fetchedUser.store_role === 'owner' ||
        fetchedUser.store_role === 'cashier';

      if (hasStoreRole) {
        console.log('🚫 Ya tiene comercio -> /menu-local');
        router.navigate(['/menu-local']);
        return false;
      }

      console.log('✅ No tiene comercio, acceso permitido');
      return true;
    }),
    catchError((error) => {
      router.navigate(['/landing']);
      return of(false);
    }),
  );
};

export const activeUserGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔐 activeUserGuard: Verificando acceso a', state.url);

  if (authService.isActiveUser()) {
    console.log('✅ activeUserGuard: Acceso permitido');
    return true;
  }

  if (authService.isAuthenticated()) {
    console.log(
      '⚠️ activeUserGuard: Email no verificado, redirigiendo a /confirmacion-codigo',
    );
    router.navigate(['/confirmacion-codigo']);
    return false;
  }

  router.navigate(['/landing']);
  return false;
};

export const ownerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('═══════════════════════════════════════');
  console.log('🔐 OWNER GUARD: Verificando acceso a', state.url);
  console.log('═══════════════════════════════════════');

  // PASO 1: Verificar token
  const hasToken = authService.isAuthenticated();
  console.log('1️⃣ ¿Tiene token?', hasToken);

  if (!hasToken) {
    console.log('❌ No hay token válido');
    router.navigate(['/landing']);
    return false;
  }

  // PASO 2: Obtener usuario
  let user = authService.getCurrentUser();
  console.log('2️⃣ Usuario en memoria:', user);

  if (!user) {
    console.log('⚠️ No hay usuario en memoria, consultando servidor...');

    return authService.fetchCurrentUser().pipe(
      tap((response) => {
        console.log('📥 Respuesta del servidor:', response);
      }),
      map((response) => {
        if (!response.successful || !response.data) {
          console.log('❌ Respuesta inválida del servidor');
          router.navigate(['/landing']);
          return false;
        }

        user = response.data;
        console.log('✅ Usuario obtenido del servidor');
        console.log('   👤 Datos:', JSON.stringify(user, null, 2));

        // Verificar email
        console.log('3️⃣ ¿Email verificado?', user.email_verified);
        if (!user.email_verified) {
          console.log('❌ Email no verificado');
          router.navigate(['/confirmacion-codigo']);
          return false;
        }

        // Verificar store_role
        console.log('4️⃣ store_role:', user.store_role);
        console.log('4️⃣ store_id:', user.store_id);
        console.log('4️⃣ ¿Es owner?', user.store_role === 'owner');

        if (user.store_role !== 'owner') {
          console.log('❌ No es owner');
          console.log('   Tipo de store_role:', typeof user.store_role);
          console.log('   Valor exacto:', JSON.stringify(user.store_role));
          alert(
            '❌ Acceso denegado: Esta sección es solo para propietarios de tiendas.\n\nTu rol actual es: ' +
              (user.store_role || 'ninguno'),
          );
          router.navigate(['/home']);
          return false;
        }

        console.log('✅✅✅ ACCESO PERMITIDO ✅✅✅');
        return true;
      }),
      catchError((error) => {
        console.error('❌ Error al obtener usuario:', error);
        console.error('   Status:', error.status);
        console.error('   Message:', error.message);
        router.navigate(['/landing']);
        return of(false);
      }),
    );
  }

  // Si el usuario ya está en memoria
  console.log('✅ Usuario ya está en memoria');
  console.log('   👤 Datos:', JSON.stringify(user, null, 2));

  // PASO 3: Verificar email
  console.log('3️⃣ ¿Email verificado?', user.email_verified);
  if (!user.email_verified) {
    console.log('❌ Email no verificado');
    router.navigate(['/confirmacion-codigo']);
    return false;
  }

  // PASO 4: Verificar store_role
  console.log('4️⃣ store_role:', user.store_role);
  console.log('4️⃣ store_id:', user.store_id);
  console.log('4️⃣ ¿Es owner?', user.store_role === 'owner');
  console.log('4️⃣ Tipo de store_role:', typeof user.store_role);

  if (user.store_role !== 'owner') {
    console.log('❌ No es owner');
    console.log('   Comparación: "' + user.store_role + '" !== "owner"');
    console.log('   Comparación estricta:', user.store_role !== 'owner');
    console.log('   ¿Es null?', user.store_role === null);
    console.log('   ¿Es undefined?', user.store_role === undefined);

    // Mostrar TODOS los datos del usuario
    console.log('📋 DATOS COMPLETOS DEL USUARIO:');
    console.table(user);

    alert(
      '❌ Acceso denegado: Esta sección es solo para propietarios de tiendas.\n\n' +
        'Tu rol actual es: ' +
        (user.store_role || 'ninguno') +
        '\n' +
        'Tipo: ' +
        typeof user.store_role,
    );
    router.navigate(['/home']);
    return false;
  }

  console.log('✅✅✅ ACCESO PERMITIDO ✅✅✅');
  console.log('═══════════════════════════════════════');
  return true;
};

export const storeAccessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('═══════════════════════════════════════');
  console.log('🔐 STORE ACCESS GUARD: Verificando acceso a', state.url);
  console.log('═══════════════════════════════════════');

  const hasToken = authService.isAuthenticated();
  console.log('1️⃣ ¿Tiene token?', hasToken);

  if (!hasToken) {
    console.log('❌ No hay token válido');
    router.navigate(['/landing']);
    return false;
  }

  let user = authService.getCurrentUser();
  console.log('2️⃣ Usuario en memoria:', user);

  if (!user) {
    console.log('⚠️ No hay usuario en memoria, consultando servidor...');

    return authService.fetchCurrentUser().pipe(
      map((response) => {
        if (!response.successful || !response.data) {
          console.log('❌ Respuesta inválida del servidor');
          router.navigate(['/landing']);
          return false;
        }

        user = response.data;
        console.log('✅ Usuario obtenido del servidor');

        if (!user.email_verified) {
          console.log('❌ Email no verificado');
          router.navigate(['/confirmacion-codigo']);
          return false;
        }

        console.log('4️⃣ store_role:', user.store_role);
        const hasAccess =
          user.store_role === 'owner' || user.store_role === 'cashier';

        if (!hasAccess) {
          console.log('❌ No tiene acceso a tienda');
          alert('Esta sección es solo para propietarios o cajeros de tiendas.');
          router.navigate(['/home']);
          return false;
        }

        console.log('✅ ACCESO PERMITIDO');
        return true;
      }),
      catchError((error) => {
        console.error('❌ Error:', error);
        router.navigate(['/landing']);
        return of(false);
      }),
    );
  }

  if (!user.email_verified) {
    console.log('❌ Email no verificado');
    router.navigate(['/confirmacion-codigo']);
    return false;
  }

  console.log('4️⃣ store_role:', user.store_role);
  const hasAccess =
    user.store_role === 'owner' || user.store_role === 'cashier';

  if (!hasAccess) {
    console.log('❌ No tiene acceso a tienda');
    console.table(user);
    alert('Esta sección es solo para propietarios o cajeros de tiendas.');
    router.navigate(['/home']);
    return false;
  }

  console.log('✅ ACCESO PERMITIDO');
  console.log('═══════════════════════════════════════');
  return true;
};
