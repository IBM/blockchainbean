module.exports = {
  // Replace "your-sample" with the name of the sample recognized by the IBM Blockchain Platform.
  // Samples must be registered by the IBM team who manage the IBM Blockchain Platform service;
  // you cannot register samples yourself at this time.
  'your-sample': {
    'completed_steps': [
      // Step 1 - install prerequisites, provision blockchain network and Cloudant wallet.
      {
        // name of step, can be anything. appears in toast when there is an error
        'step': 'started',

        // helps pace the progress bar (seconds)
        'next_step_expected_duration_s': 5 * 60,

        // ui will give up on sample and log an error after timeout
        'next_step_timeout_s': 8 * 60
      },
      // Step 2 - deploy contracts (Fabric chaincodes, Composer business networks).
      {
        'step': 'deploy_contracts',
        'next_step_expected_duration_s': 2 * 60,
        'next_step_timeout_s': 5 * 60
      },
      // Step 3 - deploy REST servers.
      {
        'step': 'deploy_rest_servers',
        'next_step_expected_duration_s': 2 * 60,
        'next_step_timeout_s': 5 * 60
      },
      // Step 4 - deploy applications.
      {
        'step': 'deploy_apps',
        'next_step_expected_duration_s': 2 * 60,
        'next_step_timeout_s': 5 * 60
      },
      // Step 5 - gather the URLs for the REST servers.
      {
        'step': 'gather_rest_server_urls',
        'next_step_expected_duration_s': 1 * 60,
        'next_step_timeout_s': 2 * 60
      },
      // Step 6 - gather the URLs for the applications.
      {
        'step': 'gather_app_urls',
        'next_step_expected_duration_s': 1 * 60,
        'next_step_timeout_s': 2 * 60
      },
      // Step 7 - start the REST servers.
      {
        'step': 'start_rest_servers',
        'next_step_expected_duration_s': 2 * 60,
        'next_step_timeout_s': 5 * 60
      },
      // Step 8 - start the applications.
      {
        'step': 'start_apps',
        'next_step_expected_duration_s': 2 * 60,
        'next_step_timeout_s': 5 * 60
      },
      // Last step - complete!
      {
        'step': 'sample_up',
      }
    ]
  }
};