$(".section .header").click(function() {
	$(this).parent().toggleClass("active");
});

function CalculateGrade(marks) {
	// June 2018 grade boundaries
	// https://filestore.aqa.org.uk/over/stat_pdf/AQA-A-LEVEL-RL-GDE-BDY-JUN-2018.PDF
	if (marks >= 69) return "A*";
	else if (marks >= 63) return "A";
	else if (marks >= 52) return "B";
	else if (marks >= 41) return "C";
	else if (marks >= 31) return "D";
	else if (marks >= 21) return "E";
	return "U";
}

const TOTAL_MARKS = 75;
function CalculateMarks() {
	let highest = 0;
	let lowest = 0;

	$(".band-selector:not(.cross-referenced).active").each(function() {
		let marks = $(this).parent().find("> td:nth-child(2)").text();
		if (marks.indexOf("-") !== -1) {
			let marks_split = marks.split("-");
			let highest_bound = Number(marks_split[1]);
			let lowest_bound = Number(marks_split[0]);
			highest += highest_bound;
			lowest += lowest_bound;
		} else {
			highest += Number(marks);
			lowest += Number(marks);
		}
	});

	CalculateCodingStyleBand();
	CalculateTechniquesUsedBand();

	if ($("#techniques-used .band-achievable.active").length > 0 && $("#techniques-used .band-achievable.active").closest("tr").data("level")) {
		let marks_split = $("#techniques-used .band-achievable.active").closest("tr").find("> td:nth-child(2)").text().split("-");
		let extra_marks = Number(marks_split[1]) - Number(marks_split[0]);
		let max_progress = $("#technical-skills .band-selector.active").data("max_progress") + $("#coding-styles .band-achievable.active").data("max_progress");
		let progress = $("#technical-skills .band-selector.active").data("progress") + $("#coding-styles .band-achievable.active").data("progress");
		let marks = Number(marks_split[0]) + Math.round(extra_marks * (progress / max_progress));
		highest += marks;
		lowest += marks;
	}

	let median = Math.round((highest + lowest) / 2);
	
	$("#upper-bound").text(highest + " (" + Math.round((highest / TOTAL_MARKS) * 100) + "%)");
	$("#median").text(median + " (" + Math.round((median / TOTAL_MARKS) * 100) + "%)");
	$("#lower-bound").text(lowest + " (" + Math.round((lowest / TOTAL_MARKS) * 100) + "%)");

	$("#grades").text(CalculateGrade(highest) + "/" + CalculateGrade(median) + "/" + CalculateGrade(lowest));
}

function ValidateDesiredTechnicalSkillsBand(band, silent) {
	switch(band) {
		case "a":
			if (Math.round($("#technical-skills .band-c").data("progress") / $("#technical-skills .band-c").data("max_progress") * 100) < 67) {
				if (!silent) alert("You have not made at least 67% progress in band C yet.");
				return false;
			}
			if (Math.round($("#technical-skills .band-b").data("progress") / $("#technical-skills .band-b").data("max_progress") * 100) < 67 && ($("#technical-skills .band-c").data("progress") !== $("#technical-skills .band-c").data("max_progress")) || Math.round($("#technical-skills .band-b").data("progress") / $("#technical-skills .band-b").data("max_progress") * 100) < 50) {
				if (!silent) alert("You have not made at least 67% progress in band B OR 100% progress in band C and at least 50% progress in band B yet.");
				return false;
			}
			if ($("#technical-skills .band-a").data("progress") == 0) {
				if (!silent) alert("You have not made any progress in this band yet.");
				return false;
			}
			break;
		case "b":
			if ($("#technical-skills .band-c").data("progress") / $("#technical-skills .band-c").data("max_progress") < 0.5) {
				if (!silent) alert("You have not made at least 50% progress in band C yet.");
				return false;
			}
			if ($("#technical-skills .band-b").data("progress") == 0) {
				if (!silent) alert("You have not made any progress in this band yet.");
				return false;
			}
			break;
		case "c":
			if ($("#technical-skills .band-c").data("progress") == 0) {
				if (!silent) alert("You have not made any progress in this band yet.");
				return false;
			}
			break;
	}

	return true;
}
$("#technical-skills .band-selector").click(function() {
	let band_row = $(this).closest("tr");

	if (ValidateDesiredTechnicalSkillsBand(band_row.data("band")) === false) return;

	$(this).closest("tbody").find(".band-selector").removeClass("active");
	$(this).toggleClass("active");
	CalculateMarks();
});
$("table:not(#technical-skills) .band-selector").click(function() {
	$(this).closest("tbody").find(".band-selector").removeClass("active");
	$(this).toggleClass("active");
	CalculateMarks();
});

function CalculateTechniquesUsedBand() {
	$("#techniques-used .band-achievable").removeClass("active");

	let technical_skills_band = Number($("#technical-skills .band-selector.active").closest("tr").data("level") || 0);
	let coding_styles_band = Number($("#coding-styles .band-achievable.active").closest("tr").data("level") || 0);
	if (technical_skills_band > 0 && coding_styles_band > 0) {
		if (technical_skills_band > 1 && coding_styles_band > 1) {
			if (technical_skills_band > 2 && coding_styles_band > 2) {
				$("#techniques-used .level-3").addClass("active");
			} else {
				$("#techniques-used .level-2").addClass("active");
			}
		} else {
			$("#techniques-used .level-1").addClass("active");
		}
	}
}
$("#technical-skills .band-selector").each(function() {
	let band = $(this);
	let band_row = band.closest("tr");
	band.data("text", band.text().replace(" (0%)", ""));
	band.data("progress", 0);
	band.data("max_progress", $("#technical-skills tr[data-band='" + band_row.data("band") + "'] input[type='checkbox']").length);
});
$("#technical-skills input[type='checkbox']").change(function() {
	let band = $(".band-" + $(this).closest("tr").data("band"));

	let progress = band.data("progress");
	if ($(this).prop("checked")) {
		progress += 1;
	} else {
		progress -= 1;
	}
	band.data("progress", progress);

	band.text(band.data("text") + " (" + Math.round((progress / band.data("max_progress")) * 100) + "%)");

	if ($("#technical-skills .band-a").hasClass("active") && ValidateDesiredTechnicalSkillsBand("a", true) === false) {
		$("#technical-skills .band-a").removeClass("active");
		if (ValidateDesiredTechnicalSkillsBand("b", true)) {
			$("#technical-skills .band-b").addClass("active");
		} else if (ValidateDesiredTechnicalSkillsBand("c", true)) {
			$("#technical-skills .band-c").addClass("active");
		}
	}
	if ($("#technical-skills .band-b").hasClass("active") && ValidateDesiredTechnicalSkillsBand("b", true) === false) {
		$("#technical-skills .band-b").removeClass("active");
		if (ValidateDesiredTechnicalSkillsBand("c", true)) {
			$("#technical-skills .band-c").addClass("active");
		}
	}
	if ($("#technical-skills .band-c").hasClass("active") && ValidateDesiredTechnicalSkillsBand("c", true) === false) {
		$("#technical-skills .band-c").removeClass("active");
	}

	CalculateMarks();
});

function CalculateCodingStyleBand() {
	$("#coding-styles .band-achievable").removeClass("active");
	if ($("#coding-styles .basic").data("progress") > 0) {
		if ($("#coding-styles .basic").data("progress") == $("#coding-styles .basic").data("max_progress") && $("#coding-styles .good").data("progress") > 0) {
			if (
				(
					$("#coding-styles .good").data("progress") == $("#coding-styles .good").data("max_progress") && $("#coding-styles .excellent").data("progress") > 0
				) ||
				(
					$("#coding-styles .good").data("progress") / $("#coding-styles .good").data("max_progress") >= 0.5 &&
					$("#coding-styles .excellent").data("progress") / $("#coding-styles .excellent").data("max_progress") > 0.5
				)
			) {
				$("#coding-styles .excellent").addClass("active");
			} else {
				$("#coding-styles .good").addClass("active");
			}
	 	} else {
			$("#coding-styles .basic").addClass("active");
		}
	}
}

$("#coding-styles tbody tr").each(function() {
	let band_row = $(this);
	let band = band_row.find("> td:first-child");
	band.data("text", band.text().replace(" (0%)", ""));
	band.data("progress", 0);
	band.data("max_progress", band_row.find("input[type='checkbox']").length);
});
$("#coding-styles input[type='checkbox']").change(function() {
	let band_row = $(this).closest("tr");
	let band = band_row.find("> td:first-child");

	let progress = band.data("progress");
	if ($(this).prop("checked")) {
		progress += 1;
	} else {
		progress -= 1;
	}
	band.data("progress", progress);

	band.text(band.data("text") + " (" + Math.round((progress / band.data("max_progress")) * 100) + "%)");

	CalculateMarks();
});

$("#hash-tables-checkbox").change(function() {
	if ($(this).prop("checked") && !$("#hashing-checkbox").prop("checked")) {
		$("#hashing-checkbox").prop("checked", true).change();
	}
});