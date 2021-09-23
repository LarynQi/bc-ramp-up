<template>
  <div id="employee-form">
    <label>Shapefile upload</label>
    <form class="upload" @submit.prevent="handleFileSubmit" @change="previewFiles" >
        <input type="file" name="uploadFile" accept=".zip" required />
        <br/><br/>
        <input type="submit" />
    </form>

    <button class="btn btn-info" @click="onPickFile">Upload profile picture</button>
    <input
      type="file"
      style="display: none"
      ref="fileInput"
      @change="onFilePicked"/>

    <form @submit.prevent="handleSubmit">
      <!-- <input type="text" /> -->
      <label>Employee name</label>
      <input
        ref="first"
        type="text"
        :class="{ 'has-error': submitting && invalidName }"
        v-model="employee.name"
        @focus="clearStatus"
        @keypress="clearStatus"
      />
      <label>Employee Email</label>
      <!-- <input type="text" /> -->
      <!-- <input v-model="employee.email" type="text" /> -->
      <input
        type="text"
        :class="{ 'has-error': submitting && invalidEmail }"
        v-model="employee.email"
        @focus="clearStatus"
        @keypress="clearStatus"
      />
      <p v-if="error && submitting" class="error-message">
        Please fill out all required fields.
      </p>
      <p v-if="success" class="success-message">
        Employee successfully added!
      </p>
      <button>Add Employee</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'employee-form',
  data() {
    return {
      submiting: false,
      error: false,
      success: false,
      employee: {
        name: '',
        email: '',
      },
      selectedFile: null,
    }
  },
  methods: {
    async onPickFile () {
  this.$refs.fileInput.click()
  },
    async handleFileSubmit() {
      console.log("starting upload...");
      // console.log(event.target.files);
      const MY_ACCESS_TOKEN = '';
      const mbxUploads = require('@mapbox/mapbox-sdk/services/uploads');

      const mbxClient = require('@mapbox/mapbox-sdk');
      const baseClient = mbxClient({ accessToken: MY_ACCESS_TOKEN });

      const uploadsClient = mbxUploads(baseClient);
      // import * as fs from 'fs';

      const AWS = require('aws-sdk');
      const getCredentials = () => {
        return uploadsClient
          .createUploadCredentials()
          .send()
          .then(response => response.body);
      }
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
          // Body: fs.createReadStream('/path/to/file.mbtiles')
        }).promise();
      };
      // console.log(await getCredentials());
      // let credentials = await getCredentials();
      // console.log(credentials);
      // credentials = putFileOnS3(credentials);
      // response.then(console.log);
      // response.then((res) => console.log(res));
      const credentials = await getCredentials();
      putFileOnS3(credentials);

      const myUsername = 'larynqi';
      const myTileset = 'myTileset'
      // const credentials = uploadsClient.createUploadCredentials();
      uploadsClient.createUpload({
        tileset: `${myUsername}.${myTileset}`,
        url: credentials.url,
        name: 'JMLQ UPLOAD0',
      })
        .send()
        .then(response => {
          const upload = response.body;
          console.log(upload);
        });
      
    },
  // async onFilePicked (event) {
  //   const files = event.target.files
  //   let filename = files[0].name
  //   const fileReader = new FileReader()
  //   fileReader.addEventListener('load', () => {
  //     this.imageUrl = fileReader.result
  //   })
  //   fileReader.readAsDataURL(files[0])
  //   this.image = files[0]
  //   console.log(filename);
  //   await handleFileSubmit(this.image);
  // },

  async previewFiles(event) {
    this.selectedFile = event.target.files[0];
  }, 

    handleSubmit() {
      console.log('testing handleSubmit')
      this.submitting = true
      this.clearStatus()

      if (this.invalidName || this.invalidEmail) {
        this.error = true
        return
      }

      this.$emit('add:employee', this.employee)
      this.$refs.first.focus()
      this.employee = {
        name: '',
        email: '',
      }
      this.error = false
      this.success = true
      this.submitting = false
    },

    clearStatus() {
      this.success = false
      this.error = false
    }
  },
  computed: {
      invalidName() {
        return this.employee.name === ''
      },

      invalidEmail() {
        return this.employee.email === ''
      },
  },
}
//   export default {
//     name: 'employee-form',
//     data() {
//       return {
//         employee: {
//           name: '',
//           email: '',
//         },
//       }
//     },
//     methods: {
//         handleSubmit() {
//             console.log('testing handleSubmit')
//         },
//     },
//   }
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
