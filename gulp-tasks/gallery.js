const FB = require('fb');
const gulp = require('gulp');
const path = require('path');
const request = require('request');
const fs = require('fs-extra');
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

    photos.push(largestImage);
  });

  return photos;
}

const downloadPhoto = async (photoURL, photoPath) => {
  return new Promise((resolve, reject) => {
    request(photoURL)
    .pipe(fs.createWriteStream(photoPath)).on('close', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

const downloadPhotos = async (albumPath, photos) => {
  await fs.ensureDir(albumPath);

  for (const photoInfo of photos) {
    const photoPath = path.join(albumPath, photoInfo.filename);
    await downloadPhoto(photoInfo.url, photoPath);
  }

  return photos;
};

gulp.task('gallery', async () => {
  const accessToken = await getFBAccessToken();
  FB.setAccessToken(accessToken);

  const allAlbums = await getAlbums();
  const filteredAlbums = allAlbums.filter((albumInfo) => {
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
  const galleries = [];
  for (const albumInfo of filteredAlbums) {
    console.log(`Getting album info for '${albumInfo.name}'`);
    if (albumInfo.cover_photo) {
      const photos = await getAlbumPhotos(albumInfo.id);
      let coverPhoto = null;
      const localPhotos = photos.map((photoInfo) => {
        const filename = path.basename(new URL(photoInfo.source).pathname);
        const localPhotoInfo = {
          url: photoInfo.source,
          filename,
          id: photoInfo.id,
        };

        if (albumInfo.cover_photo.id === photoInfo.id) {
          coverPhoto = localPhotoInfo;
        }

        return localPhotoInfo;
      });

      const galleryPath = path.join(__dirname, '..', 'src', 'gallery');
      const albumPath = path.join(galleryPath, albumInfo.id);

      await downloadPhotos(albumPath, localPhotos);

      coverPhoto.path = path.relative(
        albumPath,
        path.join(albumPath, coverPhoto.filename),
      );
      delete coverPhoto.url;
      await fs.writeFile(path.join(albumPath, 'album.json'), JSON.stringify({
        album: {
          id: albumInfo.id,
          name: albumInfo.name,
        },
        coverPhoto,
        photos: localPhotos.map((photoInfo) => {
          photoInfo.path = path.relative(
            albumPath,
            path.join(albumPath, coverPhoto.filename),
          );
          delete photoInfo.url;
          return photoInfo;
        }),
      }, null, 2));
    }
  }
});
