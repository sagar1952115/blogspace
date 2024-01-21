import { AnimatePresence, motion } from "framer-motion";

const AnimationWrapper = ({
  children,
  initial = { opacity: -1 },
  animate = { opacity: 1 },
  transition = { duration: 0 },
  keyValue,
  classname,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        key={keyValue}
        initial={initial}
        animate={animate}
        transition={transition}
        className={classname}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimationWrapper;
