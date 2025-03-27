const addDotBtnsAndClickHandlers = (emblaApi, dotsNode) => {
  let dotNodes = [];

  const addDotBtnsWithClickHandlers = () => {
    dotsNode.innerHTML = emblaApi
      .scrollSnapList()
      .map(() => '<button class="embla-dot" type="button"></button>')
      .join("");

    const scrollTo = (index) => {
      emblaApi.scrollTo(index);
    };

    dotNodes = Array.from(dotsNode.querySelectorAll(".embla-dot"));
    dotNodes.forEach((dotNode, index) => {
      dotNode.addEventListener("click", () => scrollTo(index), false);
    });
  };

  const toggleDotBtnsActive = () => {
    const previous = emblaApi.previousScrollSnap();
    const selected = emblaApi.selectedScrollSnap();
    dotNodes[previous].classList.remove("embla-dot--selected");
    dotNodes[selected].classList.add("embla-dot--selected");
  };

  emblaApi
    .on("init", addDotBtnsWithClickHandlers)
    .on("reInit", addDotBtnsWithClickHandlers)
    .on("init", toggleDotBtnsActive)
    .on("reInit", toggleDotBtnsActive)
    .on("select", toggleDotBtnsActive);

  return () => {
    dotsNode.innerHTML = "";
  };
};

const OPTIONS = { loop: false };

const emblaNode = document.querySelector(".embla");
const viewportNode = emblaNode.querySelector(".embla-viewport");
const dotsNode = emblaNode.querySelector(".embla-dots");
const plugins = [EmblaCarouselAutoplay()];
const emblaApi = EmblaCarousel(viewportNode, OPTIONS, plugins);

const removeDotBtnsAndClickHandlers = addDotBtnsAndClickHandlers(
  emblaApi,
  dotsNode
);

emblaApi.on("destroy", removeDotBtnsAndClickHandlers);
