// dashboard.ts - TypeScript for dashboard logic
interface UserInfo {
  roblox: { displayName: string; id: string; avatar: string } | null;
  discord: { displayName: string; id: string; avatar: string } | null;
}

const root = document.getElementById('dashboard-root');

function renderLogin() {
  root!.innerHTML = `
    <div class="min-h-screen flex items-center justify-center px-4">
      <div class="w-full max-w-md space-y-8">
        <div class="bg-zinc-950 border-zinc-800 text-center rounded-lg shadow p-8">
          <div class="flex justify-center mb-6">
            <div class="rounded-full border-2 border-red-600 p-6 inline-block">
              <svg width="40" height="40" fill="none" stroke="red" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 7v4"/><circle cx="12" cy="16" r="1.5"/></svg>
            </div>
          </div>
          <h1 class="text-2xl font-bold mb-2">Authorisation required</h1>
          <p class="mb-6 text-gray-400">Please login with Discord or Roblox OAuth to proceed.</p>
          <button id="login-btn" class="bg-white text-black px-4 py-2 rounded font-medium hover:bg-zinc-200 transition flex items-center justify-center gap-2">
            <img src="/static/discord-mark-white.svg" alt="Discord" style="width:1.5em;height:1.5em;vertical-align:middle;" />
            Login with Discord
          </button>
        </div>
        <div class="text-center text-xs text-gray-400 mt-8">
          <p class="font-semibold text-white mb-2">Trademarks & Affiliations:</p>
          <p><img src="/static/discord-mark-white.svg" alt="Discord" style="width:1em;height:1em;vertical-align:middle;" /> The Discord name and logo are trademarks of Discord Inc.</p>
          <p><img src="/static/roblox-mark.svg" alt="Roblox" style="width:1em;height:1em;vertical-align:middle;" /> The Roblox name and logo are trademarks of Roblox Corporation.</p>
          <p class="text-[11px] leading-relaxed mt-2">This site is not endorsed by or affiliated with Roblox Corporation or Discord Inc. Usage of their names and logos is solely for official OAuth login integration purposes.</p>
          <div class="flex justify-center gap-4 text-[11px] mt-2">
            <a href="/api-docs" class="hover:text-white transition-colors">API Documentation</a>
            <span>|</span>
            <a href="/terms" class="hover:text-white transition-colors">Terms of Service</a>
            <span>|</span>
            <a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('login-btn')!.onclick = () => {
      window.location.href = '/oauth/discord/callback';
  };
}

function renderDashboard(user: UserInfo) {
  root!.innerHTML = `
    <div class="min-h-screen">
      <div class="container mx-auto px-4 py-8 max-w-5xl">
        <div class="flex justify-between items-start mb-8">
          <div class="space-y-2">
            <h1 class="text-4xl font-bold tracking-tight">Cascadian Armed Forces Dashboard</h1>
            <p class="text-gray-400 text-base">Manage your Roblox and Discord connections, API keys, and account settings.</p>
          </div>
          <button id="logout-btn" class="bg-transparent border border-zinc-800 px-4 py-2 rounded hover:bg-zinc-900 text-white flex items-center">
            <svg class="mr-2" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7"/><path d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z"/></svg>Logout
          </button>
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-zinc-950 border-zinc-800 rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span style="display:inline-block;vertical-align:middle;">${robloxSVG()}</span>
                <span class="text-lg font-semibold">Roblox Account</span>
              </div>
              <span class="bg-green-600 text-white px-2 py-1 rounded text-xs">${user.roblox ? 'Connected' : 'Not Connected'}</span>
            </div>
            <div class="flex items-center gap-3 mb-4">
              <img src="${user.roblox?.avatar || '/static/default-headshot.jpg'}" class="h-14 w-14 rounded-full bg-zinc-700" alt="Roblox Avatar" />
              <div>
                <p class="font-semibold">${user.roblox?.displayName || 'Not linked'}</p>
                <p class="text-sm text-gray-400">ID: ${user.roblox?.id || '-'}</p>
              </div>
            </div>
            <button class="w-full bg-transparent border border-zinc-700 px-4 py-2 rounded hover:bg-zinc-900 text-white">View Profile</button>
          </div>
          <div class="bg-zinc-950 border-zinc-800 rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span style="display:inline-block;vertical-align:middle;">${discordSVG()}</span>
                <span class="text-lg font-semibold">Discord Account</span>
              </div>
              <span class="bg-green-600 text-white px-2 py-1 rounded text-xs">${user.discord ? 'Connected' : 'Not Connected'}</span>
            </div>
            <div class="flex items-center gap-3 mb-4">
              <img src="${user.discord?.avatar || '/static/default-headshot.jpg'}" class="h-14 w-14 rounded-full bg-zinc-700" alt="Discord Avatar" />
              <div>
                <p class="font-semibold">${user.discord?.displayName || 'Not linked'}</p>
                <p class="text-sm text-gray-400">ID: ${user.discord?.id || '-'}</p>
              </div>
            </div>
            <button class="w-full bg-red-900 hover:bg-red-800 text-white border-0 px-4 py-2 rounded">Unlink Discord</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('logout-btn')!.onclick = () => {
      fetch('/api/logout', { method: 'POST', credentials: 'include' }).then(() => {
          renderLogin();
      });
  };
}

function robloxSVG() {
    return `<svg width="28" height="28" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_10_85)">
      <path d="M31.6984 0L0 118.302L118.302 150L150 31.6984L31.6984 0ZM87.1031 95.9652L54.0454 87.1031L62.9075 54.0454L95.9784 62.9075L87.1031 95.9652Z" fill="white"></path>
    </g>
    <defs>
      <clipPath id="clip0_10_85">
        <rect width="150" height="150" fill="white"></rect>
      </clipPath>
    </defs>
  </svg>`;
}

function discordSVG() {
    return `<svg width="20" height="20" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"></path>
  </svg>`;
}

function fetchUserInfo() {
    fetch('/api/user', { credentials: 'include' })
        .then((res) => {
            if (res.status === 401) {
                renderLogin();
                return null;
            }
            return res.json();
        })
        .then((user: UserInfo | null) => {
            if (user) renderDashboard(user);
        })
        .catch(() => renderLogin());
}

fetchUserInfo();
