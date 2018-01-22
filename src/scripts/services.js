const fadeOutImage = (imgContainer) => {
  return new Promise((resolve) => {
    imgContainer.style.opacity = 0;
    imgContainer.addEventListener('transitionend', resolve, false);
    // TODO: Set timeout for catchall
  });
};

const fadeInImage = (imgContainer) => {
  return new Promise((resolve) => {
    imgContainer.style.opacity = 1;
    imgContainer.addEventListener('transitionend', resolve, false);
    // TODO: Set timeout for catchall
  });
};

const setNewImage = (imgContainer, newImgPath) => {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      imgContainer.style.backgroundImage = `url('${newImgPath}')`;
      resolve();
    });
  });
};

const changeImage = async (imgContainer, newImgPath) => {
  await fadeOutImage(imgContainer);
  await setNewImage(imgContainer, newImgPath);
  await fadeInImage(imgContainer);
};

const servicesLoop = () => {
  const imgContainer = document.querySelector('.services__img');
  if(!imgContainer) {
    return;
  }

  const serviceImagesData = imgContainer.dataset.servicesImages;
  if (!serviceImagesData) {
    return;
  }

  const imgPaths = serviceImagesData.split(',');
  let currentIndex = 1;
  setInterval(() => {
    if (currentIndex >= imgPaths.length) {
      currentIndex = 0;
    }

    changeImage(imgContainer, imgPaths[currentIndex]);

    currentIndex++;
  }, 5000);
};

window.addEventListener('load', () => {
  servicesLoop();
});
