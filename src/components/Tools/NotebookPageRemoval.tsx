import { motion } from "motion/react";
import styles from "./NotebookPageRemoval.module.css";

/** Faceted paper replaces the folding sheet, then falls out of the notebook. */
export default function NotebookPageRemoval({
  reducedMotion,
  onComplete,
}: {
  reducedMotion: boolean;
  onComplete: () => void;
}) {
  return (
    <div className={styles.paperBallAnchor} aria-hidden="true">
      <motion.div
        className={styles.paperBall}
        initial={{ opacity: 0, scale: 1.2, y: 0, rotate: -18 }}
        animate={
          reducedMotion
            ? { opacity: 0 }
            : {
                opacity: [0, 0, 1, 1, 1, 0],
                scale: [1.2, 1.2, 1, 0.9, 0.88, 0.84],
                rotate: [-18, -18, 8, 22, 65, 125],
                y: [0, 0, 0, 8, 150, 520],
                x: [0, 0, 0, 2, 12, 26],
              }
        }
        transition={{
          duration: reducedMotion ? 0.01 : 1.8,
          times: [0, 0.36, 0.53, 0.64, 0.83, 1],
          ease: "easeIn",
        }}
        onAnimationComplete={onComplete}
      >
        <svg viewBox="0 0 120 120" focusable="false">
          <path
            fill="#e7e2da"
            d="M14 30 30 14 48 18 62 6 78 20 98 25 104 44 116 58 105 77 108 94 87 101 72 115 51 106 31 111 18 91 6 75 13 57 5 44Z"
          />
          <path fill="#fffdf5" d="M14 30 30 14 40 45 13 57Z" />
          <path fill="#beb8b0" d="M30 14 48 18 40 45Z" />
          <path fill="#f7f4ee" d="M48 18 62 6 68 39 40 45Z" />
          <path fill="#d4cec6" d="M62 6 78 20 68 39Z" />
          <path fill="#fffdf8" d="M78 20 98 25 87 54 68 39Z" />
          <path fill="#b6afa7" d="M98 25 104 44 87 54Z" />
          <path fill="#f4f0e8" d="M104 44 116 58 100 65 87 54Z" />
          <path fill="#b4ada5" d="M116 58 105 77 84 82 100 65Z" />
          <path fill="#faf7f0" d="M5 44 13 57 40 45 29 76 6 75Z" />
          <path fill="#a8a198" d="M40 45 52 66 29 76Z" />
          <path fill="#ece7df" d="M40 45 68 39 58 57 52 66Z" />
          <path fill="#c5bfb7" d="M68 39 87 54 58 57Z" />
          <path fill="#fffdf8" d="M58 57 87 54 84 82 52 66Z" />
          <path fill="#bdb6ae" d="M87 54 100 65 84 82Z" />
          <path fill="#d4cec5" d="M6 75 29 76 18 91Z" />
          <path fill="#fffaf0" d="M29 76 52 66 46 91 31 111 18 91Z" />
          <path fill="#aaa299" d="M52 66 65 88 46 91Z" />
          <path fill="#f5f0e8" d="M52 66 84 82 65 88Z" />
          <path fill="#d0c8bd" d="M46 91 65 88 51 106 31 111Z" />
          <path fill="#fffaf2" d="M65 88 84 82 87 101 72 115 51 106Z" />
          <path fill="#b8afa4" d="M84 82 105 77 87 101Z" />
          <path fill="#f9f4ec" d="M105 77 108 94 87 101Z" />
          <path
            fill="none"
            stroke="#fff"
            strokeOpacity=".55"
            strokeWidth=".7"
            d="M30 14 40 45 52 66 65 88 72 115M62 6 68 39 87 54 84 82 87 101M13 57 40 45 68 39M29 76 52 66 84 82"
          />
        </svg>
      </motion.div>
    </div>
  );
}
