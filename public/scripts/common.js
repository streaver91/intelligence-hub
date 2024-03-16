'use strict';

const common = ((window) => {
  const common = {};

  const TIMEOUT = 5000;
  const OOPS = 'Your most recent request failed. Please retry!';
  const UNKNOWN_ERROR = {
    success: false,
    errors: {}
  };
  const DEFAULT_ACTION = 'app';

  const submit = async function (url, fields, action) {
    action = action || DEFAULT_ACTION;
    const data = {};
    for (const field of fields) {
      data[field] = this[field];
      delete this.errors[field];
    }
    const controller = new AbortController();
    const controllerTimeout = setTimeout(() => controller.abort(), TIMEOUT);
    delete this.oops[action];
    delete this.success[action];
    this.pending[action] = true;

    try {
      let response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw UNKNOWN_ERROR;
      }
      response = await response.json();
      response.success = response.success || false;
      if (!response.success) {
        throw response;
      }
      this.success[action] = true;
      const redirect = response.redirect;
      if (redirect !== undefined) {
        window.location.href = redirect;
      }
      return response;
    } catch (error) {
      const response = error instanceof Error ? UNKNOWN_ERROR : error;
      response.errors = response.errors || {};
      if (Object.keys(response.errors).length == 0) {
        this.oops[action] = OOPS;
        return response;
      }
      for (const field of fields) {
        if (field in response.errors) {
          this.errors[field] = response.errors[field];
        }
      }
      return response;
    } finally {
      clearTimeout(controllerTimeout);
      delete this.pending[action];
    }
  };

  common.createApp = (element, data, methods) => {
    Vue.createApp({
      data() {
        return Object.assign({
          oops: {},
          success: {},
          pending: {},
          errors: {}
        }, data);
      },
      created() {
        this.submit = submit.bind(this);
      },
      mounted() {
        console.log(this.$refs.focus);
        if (this.$refs.focus) {
          this.$nextTick(() => {
            this.$refs.focus.focus();
          });
        }
      },
      methods: methods,
    }).mount(element);
    document.querySelector(element).addEventListener('submit', (event) => {
      event.preventDefault();
    });
  };

  return common;
})(window);
