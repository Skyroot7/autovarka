'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-2xl text-orange-600 mb-8">
            {t('subtitle')}
          </p>
          <div className="max-w-3xl mx-auto text-lg text-gray-600">
            <p>
              {t('introText')}
            </p>
          </div>
        </motion.div>

        {/* Mission, Experience, Quality */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('mission')}
            </h2>
            <p className="text-gray-600">
              {t('missionText')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="text-6xl mb-4">⏱️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('experience')}
            </h2>
            <p className="text-gray-600">
              {t('experienceText')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="text-6xl mb-4">⭐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('quality')}
            </h2>
            <p className="text-gray-600">
              {t('qualityText')}
            </p>
          </motion.div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl shadow-xl p-12 mb-16">
          <h2 className="text-4xl font-bold mb-8 text-center">
            {t('whyChooseUs')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { icon: '🚚', title: t('fastDelivery'), desc: t('fastDeliveryText') },
              { icon: '🛡️', title: t('qualityGuarantee'), desc: t('qualityGuaranteeText') },
              { icon: '👨‍💼', title: t('professionalConsultation'), desc: t('professionalConsultationText') },
              { icon: '💰', title: t('competitivePrices'), desc: t('competitivePricesText') },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="text-4xl">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-orange-100">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('readyToStart')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('contactToday')}
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="tel:+380636815090"
              className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
            >
              📞 +380 63 681 50 90
            </a>
            <a
              href="viber://chat?number=%2B380636815090"
              className="bg-green-500 text-white px-8 py-4 rounded-full font-bold hover:bg-green-600 transition-colors inline-flex items-center gap-2"
            >
              💬 Viber
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

