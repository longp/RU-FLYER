

$(document).ready(function () {
  $("#createFormBtn").on("click", function () {
    $('#createForm').toggle(function () {
      $("#createForm").removeClass("hidden");
    }, function () {
      $("#createForm").addClass("hidden");
    });
  })
  $("body").addClass("bg")
});
