document.getElementById('tokenForm').addEventListener('submit', async function(e) {
  e.preventDefault(); // পেজ রিলোড বন্ধ

  const token = document.getElementById('accessToken').value.trim();
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');

  // আগের ফলাফল হাইড
  resultDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');

  if (!token) return;

  try {
    const response = await fetch(`https://naruto-acess-jwt.vercel.app/access-jwt?access_token=${encodeURIComponent(token)}`);
    const data = await response.json();

    if (data.status === 'success') {
      document.getElementById('accName').textContent = data.account_name || 'N/A';
      document.getElementById('accId').textContent = data.account_id || 'N/A';
      document.getElementById('openId').textContent = data.open_id || 'N/A';
      document.getElementById('platform').textContent = data.login_platform || data.platform || 'N/A';
      document.getElementById('region').textContent = data.region || 'N/A';
      document.getElementById('jwtToken').textContent = data.token || 'N/A';

      resultDiv.classList.remove('hidden');
    } else {
      throw new Error('API returned non-success');
    }
  } catch (err) {
    console.error(err);
    errorDiv.classList.remove('hidden');
  }
});