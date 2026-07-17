const ACCENT = "#C8FF00";
const COUNT = 16;

export function burstConfetti(x: number, y: number): void {
  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement("div");
    const size = 4 + Math.random() * 5;
    el.style.cssText = `position:fixed;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;background:${ACCENT};pointer-events:none;z-index:60;`;
    document.body.append(el);

    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
    const dist = 50 + Math.random() * 80;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const rot = (Math.random() - 0.5) * 720;

    const animation = el.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${dx * 0.7}px, ${dy}px) rotate(${rot * 0.6}deg)`,
          opacity: 1,
          offset: 0.55,
        },
        {
          transform: `translate(${dx}px, ${dy + 110}px) rotate(${rot}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 650 + Math.random() * 350,
        easing: "cubic-bezier(0.2, 0.6, 0.35, 1)",
      },
    );
    animation.onfinish = () => el.remove();
  }
}
