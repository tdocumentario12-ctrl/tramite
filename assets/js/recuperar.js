/**
 * recuperar.js
 * Flujo de recuperación de contraseña (Modal dinámico) para Proyecto SIS
 * Basado en la lógica de Hospital San José, adaptado al sistema de diseño de Trámite.
 */

const Recuperacion = {
    pasoActual: 1,
    email: '',
    countdownInterval: null,

    // Elementos del DOM (Cacheados via getter para asegurar que existen al momento de uso)
    get elements() {
        return {
            modal: document.getElementById('modal-recuperacion'),
            titulo: document.getElementById('modal-recuperacion-titulo'),
            subtitulo: document.getElementById('modal-recuperacion-subtitulo'),
            error: document.getElementById('recuperar-error'),
            btnAccion: document.getElementById('btn-accion-recuperacion'),
            textoAccion: document.getElementById('texto-accion'),
            spinner: document.getElementById('spinner-recuperacion'),
            btnCancelar: document.getElementById('btn-cancelar-recuperacion'),
            btnCerrar: document.getElementById('btn-cerrar-recuperacion'),
            
            // Pasos
            pasos: [
                document.getElementById('paso-1'),
                document.getElementById('paso-2'),
                document.getElementById('paso-3'),
                document.getElementById('paso-exito')
            ],
            dots: [
                document.getElementById('dot-1'),
                document.getElementById('dot-2'),
                document.getElementById('dot-3')
            ],

            // Inputs Paso 1
            emailInput: document.getElementById('recuperar-email'),
            
            // Inputs Paso 2
            otpCasillas: document.querySelectorAll('.otp-casilla'),
            emailDestino: document.getElementById('email-destino'),
            timerTexto: document.getElementById('timer-texto'),
            timerSegundos: document.getElementById('timer-segundos'),
            btnReenviar: document.getElementById('btn-reenviar'),

            // Inputs Paso 3
            nuevaPass: document.getElementById('nueva-pass'),
            confirmarPass: document.getElementById('confirmar-pass'),
            reqMin: document.getElementById('req-min'),
            reqMatch: document.getElementById('req-match')
        };
    },

    inicializar() {
        const el = this.elements;
        if (!el.modal) return;

        // Cerrar modal
        el.btnCancelar.onclick = () => this.cerrarModal();
        el.btnCerrar.onclick = () => this.cerrarModal();

        // Acción principal
        el.btnAccion.onclick = () => this.procesarPaso();

        // Eventos de OTP
        el.otpCasillas.forEach((casilla, index) => {
            casilla.oninput = (e) => this.handleOtpInput(e, index);
            casilla.onkeydown = (e) => this.handleOtpKeydown(e, index);
            casilla.onpaste = (e) => this.handleOtpPaste(e);
        });

        // Reenviar código
        el.btnReenviar.onclick = () => this.enviarCodigo(true);

        // Validaciones Paso 3
        el.nuevaPass.oninput = () => this.validarPasswords();
        el.confirmarPass.oninput = () => this.validarPasswords();

        el.emailInput.onkeydown = (e) => {
            if (e.key === 'Enter') this.procesarPaso();
        };
        el.confirmarPass.onkeydown = (e) => {
            if (e.key === 'Enter') this.procesarPaso();
        };
    },

    abrirModal() {
        this.pasoActual = 1;
        this.resetearFlujo();
        this.elements.modal.classList.add('visible');
        setTimeout(() => this.elements.emailInput.focus(), 300);
    },

    cerrarModal() {
        this.elements.modal.classList.remove('visible');
        if (this.countdownInterval) clearInterval(this.countdownInterval);
    },

    resetearFlujo() {
        const el = this.elements;
        this.pasoActual = 1;
        this.email = '';
        el.emailInput.value = '';
        el.nuevaPass.value = '';
        el.confirmarPass.value = '';
        el.otpCasillas.forEach(c => { c.value = ''; c.classList.remove('llena'); });
        this.mostrarPaso(1);
        this.limpiarError();
    },

    mostrarPaso(paso) {
        const el = this.elements;
        this.pasoActual = paso;

        // Ocultar todos
        el.pasos.forEach(p => { if(p) p.style.display = 'none'; });
        el.dots.forEach(d => { if(d) d.classList.remove('activo', 'completado'); });

        if (paso === 'exito') {
            el.pasos[3].style.display = 'block';
            el.btnAccion.style.display = 'none';
            el.btnCancelar.textContent = 'Cerrar';
            el.titulo.textContent = '¡Listo!';
            el.subtitulo.textContent = 'Contraseña actualizada correctamente.';
            return;
        }

        if (el.pasos[paso - 1]) el.pasos[paso - 1].style.display = 'block';
        
        // Actualizar dots
        for (let i = 0; i < el.dots.length; i++) {
            if (!el.dots[i]) continue;
            if (i < paso - 1) el.dots[i].classList.add('completado');
            if (i === paso - 1) el.dots[i].classList.add('activo');
        }

        // Configurar botón
        el.btnAccion.style.display = 'flex';
        el.btnCancelar.textContent = 'Cancelar';
        el.btnAccion.disabled = false;

        if (paso === 1) {
            el.textoAccion.textContent = 'Enviar Código';
            el.titulo.textContent = 'Recuperar Contraseña';
        } else if (paso === 2) {
            el.textoAccion.textContent = 'Verificar Código';
            el.btnAccion.disabled = true; // Se habilita al completar OTP
            el.titulo.textContent = 'Verificar Identidad';
        } else if (paso === 3) {
            el.textoAccion.textContent = 'Cambiar Contraseña';
            el.btnAccion.disabled = true; // Se habilita al cumplir requisitos
            el.titulo.textContent = 'Nueva Contraseña';
        }
    },

    setLoading(isLoading) {
        const el = this.elements;
        el.btnAccion.disabled = isLoading;
        el.textoAccion.style.display = isLoading ? 'none' : 'inline';
        el.spinner.style.display = isLoading ? 'block' : 'none';
    },

    mostrarError(msg) {
        this.elements.error.textContent = msg;
    },

    limpiarError() {
        this.elements.error.textContent = '';
    },

    async procesarPaso() {
        this.limpiarError();

        if (this.pasoActual === 1) {
            await this.enviarCodigo();
        } else if (this.pasoActual === 2) {
            await this.verificarCodigo();
        } else if (this.pasoActual === 3) {
            await this.actualizarPassword();
        }
    },

    async enviarCodigo(esReenvio = false) {
        const el = this.elements;
        const email = el.emailInput.value.trim();

        if (!email) return this.mostrarError('Ingresa tu correo electrónico.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return this.mostrarError('Correo inválido.');

        this.setLoading(true);

        try {
            // Usamos clienteSupabase definido en config.js
            const { error } = await clienteSupabase.auth.resetPasswordForEmail(email);

            if (error) throw error;

            this.email = email;
            el.emailDestino.textContent = email;
            this.mostrarPaso(2);
            this.iniciarCountdown();
            setTimeout(() => el.otpCasillas[0].focus(), 300);

            if (esReenvio) {
                if (typeof Toast !== 'undefined') Toast.success('Código reenviado');
                el.otpCasillas.forEach(c => { c.value = ''; c.classList.remove('llena'); });
            }

        } catch (err) {
            console.error('Error enviando código:', err);
            this.mostrarError(err.message.includes('rate limit') ? 'Demasiados intentos. Espera un momento.' : 'Error al enviar código.');
        } finally {
            this.setLoading(false);
        }
    },

    async verificarCodigo() {
        const el = this.elements;
        const codigo = Array.from(el.otpCasillas).map(c => c.value).join('');

        if (codigo.length !== 8) return;

        this.setLoading(true);

        try {
            const { error } = await clienteSupabase.auth.verifyOtp({
                email: this.email,
                token: codigo,
                type: 'recovery'
            });

            if (error) throw error;

            if (this.countdownInterval) clearInterval(this.countdownInterval);
            this.mostrarPaso(3);
            setTimeout(() => el.nuevaPass.focus(), 300);

        } catch (err) {
            console.error('Error verificando código:', err);
            this.mostrarError('Código inválido o expirado.');
            el.otpCasillas.forEach(c => { c.value = ''; c.classList.remove('llena'); });
            el.otpCasillas[0].focus();
        } finally {
            this.setLoading(false);
        }
    },

    async actualizarPassword() {
        const el = this.elements;
        const pass = el.nuevaPass.value;

        this.setLoading(true);

        try {
            const { error } = await clienteSupabase.auth.updateUser({ password: pass });

            if (error) throw error;

            // Cerrar sesión técnica de recuperación
            await clienteSupabase.auth.signOut();
            
            this.mostrarPaso('exito');

            // Recargar después de 3 segundos para limpiar estado
            setTimeout(() => {
                window.location.reload();
            }, 3000);

        } catch (err) {
            console.error('Error actualizando contraseña:', err);
            this.mostrarError('Error al actualizar contraseña.');
        } finally {
            this.setLoading(false);
        }
    },

    // --- Lógica OTP ---
    handleOtpInput(e, index) {
        const val = e.target.value;
        const el = this.elements;

        if (!/^\d$/.test(val)) {
            e.target.value = '';
            return;
        }

        e.target.classList.add('llena');

        if (index < el.otpCasillas.length - 1) {
            el.otpCasillas[index + 1].focus();
        }

        this.checkOtpComplete();
    },

    handleOtpKeydown(e, index) {
        const el = this.elements;
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            el.otpCasillas[index - 1].focus();
            el.otpCasillas[index - 1].value = '';
            el.otpCasillas[index - 1].classList.remove('llena');
        }
    },

    handleOtpPaste(e) {
        e.preventDefault();
        const el = this.elements;
        const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
        
        data.split('').forEach((char, i) => {
            if (el.otpCasillas[i]) {
                el.otpCasillas[i].value = char;
                el.otpCasillas[i].classList.add('llena');
            }
        });

        if (data.length > 0) {
            const nextIndex = Math.min(data.length, 7);
            el.otpCasillas[nextIndex].focus();
        }
        this.checkOtpComplete();
    },

    checkOtpComplete() {
        const codigo = Array.from(this.elements.otpCasillas).map(c => c.value).join('');
        this.elements.btnAccion.disabled = codigo.length !== 8;
    },

    // --- Countdown ---
    iniciarCountdown() {
        const el = this.elements;
        let segs = 60;
        
        el.timerTexto.style.display = 'inline';
        el.btnReenviar.style.display = 'none';
        el.timerSegundos.textContent = segs;

        if (this.countdownInterval) clearInterval(this.countdownInterval);

        this.countdownInterval = setInterval(() => {
            segs--;
            el.timerSegundos.textContent = segs;
            if (segs <= 0) {
                clearInterval(this.countdownInterval);
                el.timerTexto.style.display = 'none';
                el.btnReenviar.style.display = 'inline';
            }
        }, 1000);
    },

    // --- Validaciones Pass ---
    validarPasswords() {
        const el = this.elements;
        const p1 = el.nuevaPass.value;
        const p2 = el.confirmarPass.value;

        const minOk = p1.length >= 6;
        const matchOk = p1.length > 0 && p1 === p2;

        el.reqMin.classList.toggle('cumplido', minOk);
        el.reqMatch.classList.toggle('cumplido', matchOk);

        el.btnAccion.disabled = !(minOk && matchOk);
    }
};

// Auto-inicializar cuando el script cargue
document.addEventListener('DOMContentLoaded', () => {
    Recuperacion.inicializar();
});
