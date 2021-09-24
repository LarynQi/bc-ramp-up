<template>
  <div id="map-visualizewr">
      <label>Shapefile upload</label>
      <form class="upload" @submit.prevent="handleFileSubmit" @change="selectFile" >
          <input type="file" name="uploadFile" accept=".zip" required />
          <br/><br/>
          <input type="submit" />
      </form>
      <button class="btn btn-info" @click="getStatus">Get upload status</button>

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
      credentials: null,
      uploadsClient: null,
      sourceId: 0,
    }
  },
  methods: {
    async getStatus() {
      console.log("STARTED GET STATUS");
      const status = await this.uploadsClient.listUploads()
      .send()
      .then(response => {
        const uploads = response.body;
        console.log("STATUS", uploads);
        console.log("MOST RECENT UPLOAD STATUS: ", response.body[0].complete);
        return response.body[0].complete;
      });
      return status;
    },

    generateColor() {
      return "#" + Math.floor(Math.random()*16777215).toString(16);
    },
    async handleFileSubmit() {
      console.log("starting upload...");

      const MY_ACCESS_TOKEN = '';
      // const MY_ACCESS_TOKEN = '';
      const mbxUploads = require('@mapbox/mapbox-sdk/services/uploads');
      const mbxClient = require('@mapbox/mapbox-sdk');
      let uploadsClient;
      if (this.uploadsClient == null) {
        const baseClient = mbxClient({ accessToken: MY_ACCESS_TOKEN });
        this.uploadsClient  = mbxUploads(baseClient);
      }
      uploadsClient = this.uploadsClient

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
      let credentials;
      if (this.credentials == null) {
        this.credentials =  await getCredentials();
      }
      credentials = this.credentials;
      // const credentials = 
      putFileOnS3(credentials);
      console.log('CREDENTIALS:', credentials);
      const myUsername = 'larynqi';
      const myTileset = 'myTileset' + this.sourceId.toString();

      let tilesetid;

      console.log("CREDENTIALS.URL", credentials.url);

      await uploadsClient.createUpload({
        tileset: `${myUsername}.${myTileset}`,
        url: credentials.url,
        name: 'JMLQ UPLOAD' + this.sourceId.toString(),
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
      
      let uploadStatus = false;
      while (!uploadStatus) {
        uploadStatus = await this.getStatus();
      }
      this.map = this.map.addSource('my-data' + this.sourceId.toString(), {
          type: 'vector',
          url: `mapbox://${tilesetid}`
        });
      console.log("CURRENT LAYER ID", this.sourceId.toString());
      this.map = this.map.addLayer({
          'id': 'my-data' + this.sourceId.toString(),
          'type': 'line',
          'source': 'my-data' + this.sourceId.toString(),
          'source-layer': 'JMLQ UPLOAD' + this.sourceId.toString(),
          'layout': {
          // Make the layer visible by default.
          'visibility': 'visible',
          'line-join': 'round',
          'line-cap': 'round'
          },
          'paint': {
          'line-color': this.generateColor(),
          'line-width': 7
          }
        });
      console.log("SOURCE SUCCESS", this.map);
      this.sourceId += 1;
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
