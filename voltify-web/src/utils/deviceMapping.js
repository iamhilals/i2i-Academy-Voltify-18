export const getDeviceLocalImage = (type, name) => {
  const lower = (name || '').toLowerCase();
  
  if (lower.includes('akıllı ampul') || lower.includes('lamba') || lower.includes('bulb')) return '/bulb.png';
  if (lower.includes('akıllı priz') || lower.includes('plug')) return '/plug.png';
  if (lower.includes('ankastre fırın')) return '/oven.png';
  if (lower.includes('ankastre ocak')) return '/stove.png';
  if (lower.includes('masaüstü') || lower.includes('bilgisayar (masaüstü)')) return '/desktop.png';
  if (lower.includes('bulaşık makinesi')) return '/dishwasher.png';
  if (lower.includes('buzdolabı')) return '/fridge.png';
  if (lower.includes('çamaşır kurutma makinesi') || lower.includes('kurutucu')) return '/dryer.png';
  if (lower.includes('çamaşır makinesi') || lower.includes('washer')) return '/washer.png';
  if (lower.includes('derin dondurucu')) return '/freezer.png';
  if (lower.includes('laptop') || lower.includes('dizüstü')) return '/laptop.png';
  if (lower.includes('radyatör') || lower.includes('ufo') || (lower.includes('ısıtıcı') && !lower.includes('su'))) return '/heater.png';
  if (lower.includes('elektrikli süpürge') || lower.includes('robot')) return '/vacuum.png';
  if (lower.includes('fırın (mini') || lower.includes('mikrodalga')) return '/microwave.png';
  if (lower.includes('kahve makinesi') || lower.includes('espresso')) return '/coffee_maker.png';
  if (lower.includes('klima') || lower.includes(' ac')) return '/ac.png';
  if (lower.includes('mikser') || lower.includes('blender')) return '/blender.png';
  if (lower.includes('oyun makinesi') || lower.includes('konsol')) return '/console.png';
  if (lower.includes('su ısıtıcısı') || lower.includes('kettle')) return '/kettle.png';
  if (lower.includes('televizyon') || lower.includes(' tv') || lower.startsWith('tv')) return '/tv.png';
  if (lower.includes('tost makinesi') || lower.includes('panini')) return '/panini.png';
  if (lower.includes('vantilatör') || lower.includes('fan')) return '/fan.png';
  if (lower.includes('kombi') || lower.includes('boiler')) return '/boiler.png';

  // Fallbacks if only type matches and name is something else
  const lType = (type || '').toLowerCase();
  if (lType.includes('soğutucu')) return '/fridge.png';
  if (lType.includes('iklimlendirme')) return '/ac.png';
  if (lType.includes('çamaşır')) return '/washer.png';
  if (lType.includes('bulaşık')) return '/dishwasher.png';
  if (lType.includes('elektronik')) return '/tv.png';

  return '/plug.png'; // final default fallback
};
