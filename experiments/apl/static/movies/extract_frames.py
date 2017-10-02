"""Extract frames from movies for visualisation of motion etc"""

import cv2

vidcap = cv2.VideoCapture('e1_A3VMKLJTSGYKHN_t4.mp4')
success,image = vidcap.read()
count = 0
success = True

while success:
	success,image = vidcap.read()
	if round(float(count)/3)==(float(count)/3):
		cv2.imwrite("frame%d.png" % count, image)     # save frame as JPEG file
		print 'Read a new frame: ', success, count

	count += 1