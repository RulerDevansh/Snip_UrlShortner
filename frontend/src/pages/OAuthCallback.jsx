import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';

export default function OAuthCallback() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      toast.error('OAuth authentication failed.');
      navigate('/login', { replace: true });
      return;
    }

    // Set token in axios headers so getMe works
    import('../services/api').then(({ default: api }) => {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      authService.getMe()
        .then((data) => {
          login(token, data.user);
          toast.success(`Welcome, ${data.user.name}!`);
          navigate('/dashboard', { replace: true });
        })
        .catch(() => {
          toast.error('Could not verify your account. Please log in again.');
          navigate('/login', { replace: true });
        });
    });
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
      <Loader size="lg" />
      <p className="text-gray-500 text-sm">Completing sign-in…</p>
    </div>
  );
}
