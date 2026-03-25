import express from 'express';
import webpush from 'web-push';
import { db } from '../config/db.js';

const router = express.Router();

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

// Kirim VAPID public key ke frontend
router.get('/vapid-public-key', (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Simpan subscription dari browser
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription } = req.body;
    const user_id = req.user.id;
    const { endpoint, keys } = subscription;

    await db.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth), user_id = VALUES(user_id)`,
      [user_id, endpoint, keys.p256dh, keys.auth],
    );

    return res.json({ message: 'Subscription berhasil disimpan.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Gagal menyimpan subscription.' });
  }
});

// Hapus subscription
router.delete('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    await db.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint]);
    return res.json({ message: 'Unsubscribe berhasil.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Gagal unsubscribe.' });
  }
});

// Test kirim push ke diri sendiri
router.post('/test', async (req, res) => {
  try {
    const user_id = req.user.id;
    const [subs] = await db.query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?',
      [user_id],
    );

    if (subs.length === 0) {
      return res.status(404).json({ message: 'Belum ada subscription. Aktifkan notifikasi dulu.' });
    }

    let sent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: '🔔 Test Notifikasi',
            body: 'Push notification SMKN 1 Kras berhasil!',
            icon: '/icons/icon-192.svg',
            tag: 'test-' + Date.now(),
          }),
        );
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [sub.endpoint]);
        }
      }
    }

    return res.json({ message: `Push terkirim ke ${sent} perangkat.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Gagal mengirim push.' });
  }
});

// Broadcast ke siswa (semua atau per kelas)
router.post('/broadcast', async (req, res) => {
  try {
    const { title, body, class_id } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: 'Title dan body wajib diisi.' });
    }

    const params = [];
    let where = `WHERE u.role = 'STUDENT' AND u.is_active = 1`;
    if (class_id) {
      where += ` AND u.class_id = ?`;
      params.push(class_id);
    }

    const [subs] = await db.query(
      `SELECT ps.endpoint, ps.p256dh, ps.auth
       FROM push_subscriptions ps
       JOIN users u ON ps.user_id = u.id
       ${where}`,
      params,
    );

    if (subs.length === 0) {
      return res.status(404).json({ message: 'Tidak ada siswa yang aktif berlangganan notifikasi.' });
    }

    let sent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title,
            body,
            icon: '/icons/icon-192.svg',
            badge: '/icons/icon-192.svg',
            tag: 'broadcast-' + Date.now(),
            url: '/attendance',
          }),
        );
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [sub.endpoint]);
        }
      }
    }

    return res.json({ message: `Pesan terkirim ke ${sent} perangkat siswa.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Gagal broadcast.' });
  }
});

// Helper: kirim notif ke semua subscription milik satu user
export async function sendPushToUser(user_id, payload) {
  const [subs] = await db.query(
    'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?',
    [user_id],
  );

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      );
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await db.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [sub.endpoint]);
      }
    }
  }
}

// Helper: broadcast ke semua user dengan role tertentu
export async function sendPushToRoles(roles, payload) {
  const placeholders = roles.map(() => '?').join(',');
  const [subs] = await db.query(
    `SELECT ps.endpoint, ps.p256dh, ps.auth
     FROM push_subscriptions ps
     JOIN users u ON ps.user_id = u.id
     WHERE u.role IN (${placeholders}) AND u.is_active = 1`,
    roles,
  );

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      );
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await db.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [sub.endpoint]);
      }
    }
  }
}

export default router;
