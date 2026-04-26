const { withStringsXml } = require("@expo/config-plugins");

const withAndroidAppName = (config, { name }) =>
  withStringsXml(config, (config) => {
    const strings = config.modResults.resources.string ?? [];
    const appName = strings.find((item) => item.$?.name === "app_name");

    if (appName) {
      appName._ = name;
    } else {
      strings.push({ $: { name: "app_name" }, _: name });
    }

    config.modResults.resources.string = strings;
    return config;
  });

module.exports = withAndroidAppName;
