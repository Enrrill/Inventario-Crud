import { Form, Head } from '@inertiajs/react';
import { KeyRound, Shield, Smartphone } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';

// oxfmt-ignore
type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Seguridad" />

            <h1 className="sr-only">Seguridad</h1>

            <div className="space-y-6">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
                            <KeyRound className="text-primary size-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-medium">Actualizar Contraseña</h3>
                            <p className="text-muted-foreground text-sm">
                                Asegúrate de que tu cuenta use una contraseña larga y aleatoria
                            </p>
                        </div>
                    </div>

                    <Form
                        {...SecurityController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-4"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        Contraseña actual
                                    </Label>
                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                    />
                                    <InputError message={errors.current_password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Nueva contraseña</Label>
                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        passwordrules={props.passwordRules}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirmar contraseña
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        passwordrules={props.passwordRules}
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                    >
                                        Guardar contraseña
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
                            <Smartphone className="text-primary size-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-medium">Autenticación de Dos Factores</h3>
                            <p className="text-muted-foreground text-sm">
                                Agrega una capa extra de seguridad a tu cuenta
                            </p>
                        </div>
                    </div>
                    <ManageTwoFactor
                        canManageTwoFactor={props.canManageTwoFactor}
                        requiresConfirmation={props.requiresConfirmation}
                        twoFactorEnabled={props.twoFactorEnabled}
                    />
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
                            <Shield className="text-primary size-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-medium">Passkeys</h3>
                            <p className="text-muted-foreground text-sm">
                                Gestiona tus passkeys para acceso sin contraseña
                            </p>
                        </div>
                    </div>
                    <ManagePasskeys
                        canManagePasskeys={props.canManagePasskeys}
                        passkeys={props.passkeys}
                    />
                </div>
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Seguridad',
            href: edit(),
        },
    ],
};
