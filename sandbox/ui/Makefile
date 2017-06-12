fast:
	sbt -J-Xms2g -J-Xmx8g fastOptJS
full:
	sbt -J-Xms2g -J-Xmx8g fullOptJS
clean:
	sbt clean clean-files
	rm -rf target js/target project/target project/project
scalastyle:
	sbt scalastyleGenerateConfig
run:
	sbt -J-Xms2g -J-Xmx8g ~uiSandbox/run
cont:
	sbt -J-Xms2g -J-Xmx8g ~fastOptJS
sbt:
	sbt -J-Xms2g -J-Xmx8g
