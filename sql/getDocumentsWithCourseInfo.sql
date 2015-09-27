SELECT
	Document.id as id,
    Document.courseId as courseId,
    Document.name as name,
    Document.tags as tags,
    Course.name as courseName,
    Course.codeUE as courseCodeUE
FROM Document
LEFT JOIN Course
ON Course.id = Document.courseId