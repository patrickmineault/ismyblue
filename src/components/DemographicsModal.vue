<template>
  <div class="blur-background">
    <div class="demographics-modal">
      <h2>Thanks! Before you go...</h2>
      <p>
        Please tell us a bit about yourself. This information helps us understand color perception
        across different groups.
      </p>
      <form @submit.prevent="submitDemographics">
        <div class="form-group">
          <label for="firstLanguage"
            >Languages differ in how they name colors. What's your first language?</label
          >
          <div>
            <select id="firstLanguage" v-model="firstLanguage" class="form-control">
              <option value="Unspecified">Select a language</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Portuguese">Portuguese</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Greek">Greek</option>
              <option value="Russian">Russian</option>
              <option value="Arabic">Arabic</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Thai">Thai</option>
              <option value="Vietnamese">Vietnamese</option>
              <option value="Other with color distinction">
                Another language with distinct words for red, orange, yellow, green, blue, and
                purple
              </option>
              <option value="Other without color distinction">
                Another language without a color distinction
              </option>
            </select>
          </div>
        </div>
        <h3>Are you colorblind?</h3>
        <div class="form-group">
          <label for="colorBlindness">Being colorblind might affect the results.</label>
          <div>
            <select id="colorBlindness" v-model="colorBlindness" class="form-control">
              <option value="unspecified">Select an option</option>
              <option value="dontknow">I don't know</option>
              <option value="no">No</option>
              <option value="red-green">Yes, red-green, unknown subtype</option>
              <option value="protanopia">Yes, protanopia</option>
              <option value="protanomaly">Yes, protanomaly</option>
              <option value="deuteranopia">Yes, deuteranopia</option>
              <option value="deuteranomaly">Yes, deuteranomaly</option>
              <option value="tritanopia">Yes, tritanopia</option>
              <option value="tritanomaly">Yes, tritanomaly</option>
              <option value="achromatopsia">Yes, achromatopsia</option>
              <option value="achromatomaly">Yes, achromatomaly</option>
            </select>
          </div>
          <p><b>This is not a diagnostic tool.</b></p>
        </div>
        <button type="submit" class="submit-button-demo">Submit and get results</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      firstLanguage: 'Unspecified',
      colorBlindness: 'unspecified'
    }
  },
  methods: {
    submitDemographics() {
      this.$emit('submit', {
        firstLanguage: this.firstLanguage,
        colorBlindness: this.colorBlindness
      })
    }
  }
}
</script>

<style scoped>
.blur-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.demographics-modal {
  background-color: white;
  color: black;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Cabin', sans-serif;
  font-size: 1rem;
  color: #333;
  background-color: #fff;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

select.form-control {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23333' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
  padding-right: 2rem;
}

.form-control:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

#firstLanguage {
  border: 2px solid #4a90e2;
  transition: border-color 0.3s ease;
}

#firstLanguage:hover {
  border-color: #2a70c2;
}

input[type='text'].form-control {
  border: 2px solid #4a90e2;
}

.submit-button-demo {
  background-color: #4a90e2;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  width: 100%;
  margin-top: 1rem;
}

.submit-button-demo:hover {
  background-color: #2a70c2;
}
</style>
