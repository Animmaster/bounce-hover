import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create("hop", "0.35, 0.75, 0, 1");

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const spotlightItems = Array.from(document.querySelectorAll(".spotlight-item"));
const spotlightList = document.querySelector(".spotlight-list");
const previewCards = Array.from(document.querySelectorAll(".card"));

const HEIGHT_HEADROOM = 10;
const HOVER_GROWTH = 50;
const CARD_FOLLOW_STRENGTH = 0.75;
const CARD_X_RANGE = 100;
const CARD_Y_JITTER = 50;
const CARD_ROTATION_JITTER = 20;

let baseItemHeight = 0;

const calculateBaseItemHeight = () => {
  spotlightItems.forEach((item) => (item.style.height = ""));
  baseItemHeight = Math.round(
    Math.max(...spotlightItems.map((item) => item.offsetHeight)) +
      HEIGHT_HEADROOM,
  );
  gsap.set(spotlightItems, { height: baseItemHeight });
};

window.addEventListener("load", calculateBaseItemHeight);
window.addEventListener("resize", calculateBaseItemHeight);

const animateLabelText = (label, { opacity, scaleX, scaleY, blur }) => {
  gsap.to(label, {
    opacity,
    duration: 0.1,
    delay: 0.025,
    ease: "hop",
    overwrite: "auto",
  });
  gsap.to(label, {
    scaleX,
    scaleY,
    duration: 0.25,
    ease: "back.out(1.75)",
    overwrite: "auto",
  });
  gsap.to(label, {
    filter: `blur(${blur}px)`,
    duration: 0.25,
    ease: "hop",
    overwrite: "auto",
  });
};

const initializePreviewCards = () => {
  previewCards.forEach((card, cardIndex) => {
    card.baseRotation = parseFloat(card.dataset.rotation);
    card.src = `/item_1_card_${cardIndex + 1}.jpg`;
    gsap.set(card, { rotation: card.baseRotation, scale: 0 });
  });
};
initializePreviewCards();

const positionPreviewCards = (hoveredItem, itemNumber) => {
  const listRect = spotlightList.getBoundingClientRect();
  const itemRect = hoveredItem.getBoundingClientRect();
  const followY =
    (itemRect.top + itemRect.height / 2 - listRect.top - listRect.height / 2) *
    CARD_FOLLOW_STRENGTH;

  previewCards.forEach((card, cardIndex) => {
    card.src = `/item_${itemNumber}_card_${cardIndex + 1}.jpg`;
    gsap.to(card, {
      x: gsap.utils.random(-CARD_X_RANGE, CARD_X_RANGE),
      y: followY + gsap.utils.random(-CARD_Y_JITTER, CARD_Y_JITTER),
      rotation:
        card.baseRotation +
        gsap.utils.random(-CARD_ROTATION_JITTER, CARD_ROTATION_JITTER),
      duration: 1,
      ease: "elastic.out(1, 0.5)",
      overwrite: "auto",
    });
  });
};

spotlightList.addEventListener("mouseenter", () => {
  gsap.to(previewCards, {
    scale: 1,
    duration: 0.75,
    ease: "elastic.out(1, 0.6)",
    overwrite: "scale",
  });
});

spotlightList.addEventListener("mouseleave", () => {
  gsap.to(previewCards, {
    scale: 0,
    duration: 0.5,
    ease: "power3.out",
    overwrite: "scale",
  });
  gsap.to(spotlightItems, {
    height: baseItemHeight,
    duration: 0.35,
    ease: "power3.out",
    overwrite: "auto",
  });
});

spotlightItems.forEach((item, itemIndex) => {
  const defaultLabel = item.querySelector(".label-default");
  const altLabel = item.querySelector(".label-alt");

  item.addEventListener("mouseenter", () => {
    animateLabelText(defaultLabel, {
      opacity: 0,
      scaleX: 0.75,
      scaleY: 1.25,
      blur: 1,
    });
    animateLabelText(altLabel, { opacity: 1, scaleX: 1, scaleY: 1, blur: 0 });
    positionPreviewCards(item, itemIndex + 1);

    const proximityWeights = spotlightItems.map((_, i) =>
      i === itemIndex ? 0 : 1 / Math.abs(i - itemIndex),
    );
    const totalWeight = proximityWeights.reduce((sum, w) => sum + w, 0);

    spotlightItems.forEach((otherItem, i) => {
      const targetHeight =
        i === itemIndex
          ? baseItemHeight + HOVER_GROWTH
          : Math.round(
              baseItemHeight -
                (HOVER_GROWTH * proximityWeights[i]) / totalWeight,
            );

      gsap.to(otherItem, {
        height: targetHeight,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  });

  item.addEventListener("mouseleave", () => {
    animateLabelText(defaultLabel, {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      blur: 0,
    });
    animateLabelText(altLabel, {
      opacity: 0,
      scaleX: 0.75,
      scaleY: 1.25,
      blur: 1,
    });
  });
});
