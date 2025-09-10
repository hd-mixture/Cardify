
import AuthLogics from '@/components/auth-logics';
import AuthGuard from '@/components/auth-guard';

export default function SignupPage() {
    return (
        <AuthGuard>
            <AuthLogics mode="signup" />
        </AuthGuard>
    );
}
