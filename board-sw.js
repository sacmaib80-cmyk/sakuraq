// SW จิ๋วของ board.html — มีไว้เด้ง OS notification บน Android เท่านั้น
// register ด้วย scope "./board-notify/" (ไม่มีหน้าไหนอยู่ใต้ path นี้จริง)
// → ไม่แตะ fetch ของหน้าใด ๆ และไม่ชนกับ sw.js ของแอปหลักที่คุม scope "/"

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes("board.html")) return c.focus();
      }
      return self.clients.openWindow("./board.html");
    })
  );
});
