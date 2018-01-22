const FB = require('fb');
const gulp = require('gulp');
const path = require('path');
const request = require('request');
const fs = require('fs-extra');
const mustache = require('mustache');
const { URL } = require('url');

const secrets = require('../secrets.json');

const FB_PAGE_ID = '1498763956801410';

const fbAPI = (...args) => {
  return new Promise((resolve, reject) => {
    FB.api(...args, (response) => {
      if(!response || response.error) {
        reject(!response ? 'Not response' : response.error.message);
        return;
    }

    resolve(response);
    });
  });
};

const getFBAccessToken = async () => {
  const response = await fbAPI('oauth/access_token', {
    client_id: secrets.FB_CLIENT_ID,
    client_secret: secrets.FB_CLIENT_SECRET,
    grant_type: 'client_credentials'
  });
  return response.access_token;
}

const getAlbums = async () => {
  const response = await fbAPI(`/${FB_PAGE_ID}/albums?fields=cover_photo,name`);
  return response.data;
}

const getAlbumPhotos = async (albumId) => {
  const albumPhotosResponse = await fbAPI(`/${albumId}/photos?fields=created_time,images,id`);
  const photos = [];
  albumPhotosResponse.data.forEach((photoDetails) => {
    const largestImage = photoDetails.images.sort((a, b) => {
      return a.width < b.width;
    })[0];

    largestImage.id = photoDetails.id;
    largestImage.created_time = photoDetails.created_time;

    photos.push(largestImage);
  });

  return photos.sort((a, b) => {
    return Date.parse(a.created_time) < Date.parse(b.created_time);
  });
}

const downloadPhoto = async (albumPath, photoInfo) => {
  const photoPath = path.join(albumPath, photoInfo.filename);
  const photoExists = await fs.exists(photoPath);
  if (photoExists) {
    return photoPath;
  }

  await fs.ensureDir(albumPath);

  return new Promise((resolve, reject) => {
    request(photoInfo.url)
    .pipe(fs.createWriteStream(photoPath)).on('close', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(photoPath);
    });
  });
}

const downloadAlbum = async (albumInfo, galleryPath) => {
  const albumPath = path.join(galleryPath, albumInfo.id);

  const albumDetails = {
    id: albumInfo.id,
    name: albumInfo.name,
    photos: [],
    cover: null,
  };
  const photos = await getAlbumPhotos(albumInfo.id);
  for (const photoInfo of photos) {
    const filename = path.basename(new URL(photoInfo.source).pathname);
    const localPhotoInfo = {
      url: photoInfo.source,
      filename,
      id: photoInfo.id,
      width: photoInfo.width,
      height: photoInfo.height,
      created_time: photoInfo.created_time,
    };

    const absPhotoPath = await downloadPhoto(albumPath, localPhotoInfo);
    localPhotoInfo.path = '/' + path.relative(
      path.join(__dirname, '..', 'src'),
      absPhotoPath,
    );
    albumDetails.photos.push(localPhotoInfo);

    if (albumInfo.cover_photo.id === photoInfo.id) {
      albumDetails.cover = localPhotoInfo;
    }
  };

  return albumDetails;
};

const generateGalleryFiles = async (galleryPath) => {
  const accessToken = await getFBAccessToken();
  FB.setAccessToken(accessToken);

  const allAlbums = (await getAlbums()).filter((albumInfo) => {
    switch (albumInfo.name.toLowerCase()) {
      case 'profile pictures':
      case 'mobile uploads':
      case 'cover photos':
      case 'timeline photos':
      case 'works (past & present)':
        return false;
      default:
        return true;
    }
  });


  const galleryDetails = {
    albums: []
  };
  for (const album of allAlbums) {
    const albumDetails = await downloadAlbum(album, galleryPath);
    if (albumDetails.photos.length > 0) {
      console.log(`Album ${album.name} has ` +
        `${albumDetails.photos.length} photos.`);
      galleryDetails.albums.push(albumDetails);
    }
  }

  const jsonPath = path.join(galleryPath, 'gallery.json');
  await fs.writeFile(
    jsonPath,
    JSON.stringify(galleryDetails, null, 2)
  );

  return galleryDetails;
};

const gallery = async () => {
  const galleryPath = path.join(__dirname, '..', 'src', 'gallery');

  const galleryDetails = await generateGalleryFiles(galleryPath);

  const template = (await fs.readFile(
    path.join(__dirname, 'templates', 'gallery.hbs')
  )).toString();

  const filteredAlbum = galleryDetails.albums.map((albumDetails) => {
    const clone = Object.assign({}, albumDetails);
    const filterAmount = albumDetails.photos.length > 8 ? 7 : 8;
    clone.photos = albumDetails.photos.filter((photo, index) => {
      return index < filterAmount;
    });
    if (albumDetails.photos.length > 8) {
      clone.additionalPhotos = albumDetails.photos.filter((photo, index) => {
        return index >= filterAmount;
      });
      clone.extraPhotos = clone.additionalPhotos.length;
    }
    return clone;
  });

  const renderedGallery = mustache.render(template, {
    albums: filteredAlbum,
  });

  await fs.writeFile(
    path.join(galleryPath, 'gallery.html'),
    renderedGallery,
  );
};

gulp.task(gallery);
