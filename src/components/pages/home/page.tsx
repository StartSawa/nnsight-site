import { MotionConfig, motion } from "motion/react";

/**
 * TODO: Replace this entire home page with workspace brand content.
 * This is a placeholder starter page - customize the layout, hero section,
 * background pattern, typography, and messaging to match the brand.
 */
export function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-ploy-background-primary text-ploy-text-primary flex items-center justify-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.18,
                delayChildren: 0.4,
              },
            },
          }}
          className="text-center space-y-6 px-6"
        >
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                  duration: 0.7,
                },
              },
            }}
            className="font-heading typography-heading text-4xl md:text-6xl lg:text-7xl"
          >
            Ready to Ploy
          </motion.h1>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                  duration: 0.7,
                },
              },
            }}
            className="text-lg md:text-xl lg:text-2xl text-ploy-text-secondary max-w-md mx-auto"
          >
            Make something amazing!
          </motion.p>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
