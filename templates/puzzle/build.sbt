import sbt.Keys._
import sbt.Project
import com.sap.marmolata.sbt.Import._
import com.sap.marmolata.sbt.MarmolataRootProject

lazy val commonSettings = Seq(
  organization := "com.sap",
  name := "dummy-application", 
  version := "0.1-SNAPSHOT",
  scalaVersion in ThisBuild := "2.11.8",
  pollInterval  := 50,
  libraryDependencies += Dependencies.logback_classic.value,
  libraryDependencies += Dependencies.boopickle.value,
  resolvers := Seq(
    Resolver.url("local", new URL(Path.userHome.asFile.toURI.toURL + "/.ivy2/local"))(Resolver.ivyStylePatterns),
    DefaultMavenRepository,
    Resolver.sonatypeRepo("public"),
    Resolver.typesafeRepo("releases"),
    Resolver.sbtPluginRepo("releases"),
    "marmolata" at "http://vm-marmolata.eaalab.hpi.uni-potsdam.de/nexus/",
    "marmolata-alternative" at "https://jaheba.github.io/marmolata-mirror/nexus/"
  ),
  externalResolvers := resolvers.value
)

lazy val root = project.in(file("."))
  .enablePlugins(MarmolataRootProject)
  .settings(commonSettings: _*)
  .aggregate(mainJS, mainJVM)

lazy val main = (crossProject in file("."))
  .marmolataCrossProject("puzzle-app")
  .settings(commonSettings: _*)
  .jsSettings(
    fastOptJS in Compile := (fastOptJS in Compile dependsOn (unjarUI)).value,
    fullOptJS in Compile := (fullOptJS in Compile dependsOn (unjarUI)).value
  )

lazy val mainJS = main.js
  .settings(commonSettings: _*)
  .settings(
    libraryDependencies += "com.sap.marmolata" %%%! "app" % "hpi-5"
  )
 
lazy val mainJVM = main.jvm
  .settings(commonSettings: _*)
  .settings(
    libraryDependencies += "com.sap.marmolata" %% "app" % "hpi-5"
  )



