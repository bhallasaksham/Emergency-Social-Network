/* istanbul ignore file */

module.exports = {
  get login() {
    return require('./login').default;
  },
  get welcome() {
    return require('./welcome').default;
  },
  get main() {
    return require('./main').default;
  },
  get publicWall() {
    return require('./publicwall').default;
  },
  get shareStatus() {
    return require('./sharestatus').default;
  },
  get chatroom() {
    return require('./chatroom').default;
  },
  get privateMessage() {
    return require('./privateMessage').default;
  },
  get measurePerformance() {
    return require('./measurePerformance').default;
  },
  get measurePerformanceReport() {
    return require('./measurePerformanceReport').default;
  },
  get postAnnouncement() {
    return require('./postAnnouncement').default;
  },
  get emergencyContact() {
    return require('./emergencyContact').default;
  },

  get selfAssessment() {
    return require('./selfAssessment').default;
  },
  get selfAssessmentResult() {
    return require('./selfAssessmentResult').default;
  },
  get selfAssessmentQuiz() {
    return require('./selfAssessmentQuiz').default;
  },
  get map() {
    return require('./map').default;
  },
  get donateResources() {
    return require('./donateResources').default;
  },
  get findDonations() {
    return require('./findDonations').default;
  },
  get reportIncident() {
    return require('./reportIncident').default;
  },
  get userProfile() {
    return require('./userProfile').default;
  },
};
