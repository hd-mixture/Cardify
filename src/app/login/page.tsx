
import AuthLogics from '@/components/auth-logics';
import AuthGuard from '@/components/auth-guard';

export default function LoginPage() {
    return (
        <AuthGuard>
            <AuthLogics mode="login" />
        </AuthGuard>
    );
}
