module.exports = {
    hasExtension: function hasExtension(pathName, extension) {
        return pathName.slice(-extension.length) === extension;
    }
};