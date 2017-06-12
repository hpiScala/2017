import sbt.Keys._
import sbt.Project
import PinPlugin.PinnableDependency

lazy val commonSettings = Seq(
  organization := "com.sap",
  version := "0.0.1-SNAPSHOT",
  scalaVersion in ThisBuild:= "2.11.8",
  isScalaJSProject := false
)


lazy val dataSandbox: Project = (project in file("dataSandbox"))
  .enablePlugins(MarmolataSbtPlugin)
  .settings(commonSettings:_*)
  .pinnableDependsOn("com.sap.marmolata" %% "app" % "hpi-2")
  .pinnableDependsOn("com.sap.marmolata" %% "erp-custom-hpb" % "hpi-3" )

lazy val root = (project in file("."))
  .enablePlugins(MarmolataSbtPlugin)
  .aggregate(dataSandbox)
  .settings(commonSettings:_*)
  .settings(exportJars := false,
            publishArtifact := false,
            publish := {},
            publishTo := None,
            publishLocal := {}
            )