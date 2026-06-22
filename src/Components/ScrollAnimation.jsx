'use client'
import { motion } from "motion/react"; // Use "framer-motion" if needed

export function ScrollAnimation({ children, delay = 0, x = 0, y = 35, duration = 0.5 }) {
    return (
        <motion.div
            initial={{ opacity: 0, x, y }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 100, damping: 16, delay }}
            whileHover={{ y: -6, scale: 1.015 }}
            className="h-full"
        >
            {children}
        </motion.div>
    );
}