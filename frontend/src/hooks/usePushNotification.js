import { useState, useEffect } from 'react';
import { api } from '../services/api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotification() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window);

    // Cek apakah sudah subscribe
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscribed(!!sub);
        });
      });
    }
  }, []);

  const subscribe = async () => {
    setLoading(true);
    try {
      // Minta izin notifikasi
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Izin notifikasi ditolak.');
        return;
      }

      // Daftarkan service worker (force update jika sudah ada)
      const reg = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      await reg.update();
      await navigator.serviceWorker.ready;

      // Ambil VAPID public key
      const { data } = await api.get('/push/vapid-public-key');
      const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

      // Subscribe ke push
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Kirim subscription ke backend
      await api.post('/push/subscribe', { subscription });
      setSubscribed(true);
    } catch (err) {
      console.error('Subscribe error:', err);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.delete('/push/unsubscribe', { data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error('Unsubscribe error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testPush = async () => {
    try {
      const res = await api.post('/push/test');
      alert(res.data.message);
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal test push.');
    }
  };

  return { supported, subscribed, loading, subscribe, unsubscribe, testPush };
}
