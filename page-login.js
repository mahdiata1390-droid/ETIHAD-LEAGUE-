import { login } from "./auth-state.js";

export function renderLogin(container) {
  container.innerHTML = `
    <div class="container" style="padding-top:40px;max-width:420px;margin:0 auto;">
      <div class="glass-panel fade-up" style="padding:32px;">
        <h1 class="section-title gold-text" style="text-align:center;margin-bottom:4px;">ورود به حساب</h1>
        <p style="text-align:center;color:var(--text-muted);font-size:14px;margin-bottom:24px;">
          ویژه‌ی مدیر لیگ و بازیکنان ثبت‌نام‌شده
        </p>
        <form id="login-form" style="display:flex;flex-direction:column;gap:16px;">
          <div>
            <label style="font-size:14px;color:#cbd5e1;display:block;margin-bottom:6px;">ایمیل</label>
            <input type="email" id="login-email" class="input-field" placeholder="example@email.com" dir="ltr" required />
          </div>
          <div>
            <label style="font-size:14px;color:#cbd5e1;display:block;margin-bottom:6px;">رمز عبور</label>
            <input type="password" id="login-password" class="input-field" placeholder="••••••••" dir="ltr" required />
          </div>
          <p id="login-error" style="color:var(--red);font-size:14px;text-align:center;display:none;"></p>
          <button type="submit" id="login-submit" class="btn-gold" style="margin-top:8px;">ورود</button>
        </form>
        <p style="font-size:12px;color:var(--text-faint);text-align:center;margin-top:20px;">
          حساب بازیکنان توسط مدیر لیگ ساخته می‌شود.
        </p>
      </div>
    </div>
  `;

  const form = container.querySelector("#login-form");
  const errorEl = container.querySelector("#login-error");
  const submitBtn = container.querySelector("#login-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "در حال ورود...";
    const email = container.querySelector("#login-email").value;
    const password = container.querySelector("#login-password").value;
    try {
      await login(email, password);
      window.location.hash = "#/";
    } catch {
      errorEl.textContent = "ایمیل یا رمز عبور اشتباه است.";
      errorEl.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.textContent = "ورود";
    }
  });
}
