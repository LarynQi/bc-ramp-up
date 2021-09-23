<template>
  <div id="map-visualizewr">
      <label>Shapefile upload</label>
      <form class="upload" @submit.prevent="handleFileSubmit" @change="selectFile" >
          <input type="file" name="uploadFile" accept=".zip" required />
          <br/><br/>
          <input type="submit" />
      </form>

      <div id="map">
      </div>
  </div>
</template>

<script>
export default {
  name: 'map-visualizer',
  data() {
    return {
      selectedFile: null,
      map: null,
    }
  },
  methods: {
    async handleFileSubmit() {
      console.log("starting upload...");

      const MY_ACCESS_TOKEN = '';
      // const MY_ACCESS_TOKEN = '';
      const mbxUploads = require('@mapbox/mapbox-sdk/services/uploads');
      const mbxClient = require('@mapbox/mapbox-sdk');
      const baseClient = mbxClient({ accessToken: MY_ACCESS_TOKEN });
      const uploadsClient = mbxUploads(baseClient);
      const AWS = require('aws-sdk');

      const getCredentials = () => {
        return uploadsClient
          .createUploadCredentials()
          .send()
          .then(response => response.body);
      }
      console.log("FILE", this.selectedFile);
      const putFileOnS3 = (credentials) => {
        const s3 = new AWS.S3({
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken,
          region: 'us-east-1'
        });
        return s3.putObject({
          Bucket: credentials.bucket,
          Key: credentials.key,
          Body: this.selectedFile
        }).promise();
      };

      const credentials = await getCredentials();
      putFileOnS3(credentials);
      console.log('CREDENTIALS:', credentials);
      const myUsername = 'larynqi';
      const myTileset = 'myTileset'

      let tilesetid;

      console.log("CREDENTIALS.URL", credentials.url);

      await uploadsClient.createUpload({
        tileset: `${myUsername}.${myTileset}`,
        url: credentials.url,
        name: 'JMLQ UPLOAD0',
      })
        .send()
        .then(response => {
          const upload = response.body;
          tilesetid = response.body.tileset;
          console.log(upload);
        });
      
      // let map = this.map;
      console.log('TILESETID: ', tilesetid);
      // this.map = this.map.on('load', () => {
      //     map = map.addSource('my-data', {
      //       type: 'vector',
      //       url: `mapbox://${tilesetid}`
      //     });
      //     console.log("SOURCE SUCCES", map);
      // });
      this.map = this.map.addSource('my-data', {
          type: 'vector',
          url: `mapbox://${tilesetid}`
        });

      this.map = this.map.addLayer({
          'id': 'my-data',
          'type': 'line',
          'source': 'my-data',
          'source-layer': 'JMLQ UPLOAD0',
          'layout': {
          // Make the layer visible by default.
          'visibility': 'visible',
          'line-join': 'round',
          'line-cap': 'round'
          },
          'paint': {
          'line-color': '#877b59',
          'line-width': 20
          }
        });
      console.log("SOURCE SUCCESS", this.map);

    },
    async selectFile(event) {
      this.selectedFile = event.target.files[0];
    }, 
    initMap() {
      const mapboxgl = require('mapbox-gl');
      const PUB_ACCESS_TOKEN = '';
      mapboxgl.accessToken = PUB_ACCESS_TOKEN;
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-122.2021804, 37.6295713],
        zoom: 8
      });
    },
  },
  mounted() {
    this.initMap();
  }

}

</script>

<style scoped>

form {
    margin-bottom: 2rem;
  }

  [class*='-message'] {
    font-weight: 500;
  }

  .error-message {
    color: #d33c40;
  }

  .success-message {
    color: #32a95d;
  }

</style>
