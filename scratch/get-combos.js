async function test() {
  try {
    const res = await fetch('https://ayurveda-saranga-backend.vercel.app/api/combos');
    const data = await res.json();
    console.log('--- Combos Response ---');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
