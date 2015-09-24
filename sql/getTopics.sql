SELECT
	topic.id, annotationId, title, solved, validAnswer,
	note.documentId as documentId,
	note.position_relSX as relSX, note.position_relSY as relSY,
	note.position_relEX as relEX, note.position_relEY as relEY,
    (SELECT COUNT(1) FROM Answer as ans WHERE ans.topicId=topic.id) as nbAnswers,
    votePositive, voteNegative,
    message.`time` as `time`, userId
FROM `Topic` as topic
LEFT JOIN Annotation as note
	ON note.id=topic.annotationId
LEFT JOIN Answer as message
	ON message.id=topic.messageId
LIMIT 10