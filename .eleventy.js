module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/index_videos");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/index.html");

  function getProjects(collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/projects/*.md")
      .sort(function (a, b) {
        return b.data.date - a.data.date;
      });
  }

  eleventyConfig.addCollection("projects", getProjects);

  eleventyConfig.addCollection("studioPosts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/studio/*.md")
      .sort(function (a, b) {
        return b.data.date - a.data.date;
      });
  });

  eleventyConfig.addCollection("prints", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/content/prints/*.md")
      .sort(function (a, b) {
        return a.data.name.localeCompare(b.data.name);
      });
  });

  eleventyConfig.addFilter("dump", function (value) {
    return JSON.stringify(value);
  });

  eleventyConfig.addFilter("firstImage", function (media) {
    if (!Array.isArray(media)) return null;
    var found = media.find(function (m) {
      return m.type === "image";
    });
    return found ? found.file : null;
  });

  eleventyConfig.addFilter("readableDate", function (date) {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
