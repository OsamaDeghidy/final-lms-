const RESTRICTED_CATEGORY_SLUGS = ['e-learning', 'diplomas'];
const RESTRICTED_CATEGORY_NAMES = ['التدريب الإلكتروني', 'الدبلومات'];

export const isAdvertisementCategory = (category) => {
  if (!category) return false;

  if (typeof category === 'string') {
    const normalizedName = category.trim();
    const normalizedSlug = normalizedName.toLowerCase();
    return (
      RESTRICTED_CATEGORY_NAMES.includes(normalizedName) ||
      RESTRICTED_CATEGORY_SLUGS.includes(normalizedSlug)
    );
  }

  const name = (category.name || '').trim();
  const slug = (category.slug || '').trim().toLowerCase();

  return (
    RESTRICTED_CATEGORY_NAMES.includes(name) ||
    RESTRICTED_CATEGORY_SLUGS.includes(slug)
  );
};

export default isAdvertisementCategory;

